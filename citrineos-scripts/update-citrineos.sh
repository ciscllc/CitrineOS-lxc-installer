#!/bin/bash
# ============================================================
# update-citrineos.sh - CitrineOS Update Script
# Version: 2.0.0
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

INSTALL_DIR="/opt/citrineos"
BACKUP_DIR="/opt/citrineos/backups"
CONFIG_FILE="$INSTALL_DIR/.env"

NO_BACKUP=false
FORCE=false
VERSION=""

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[FEHLER]${NC} $1"; }
log_progress() { echo -e "${PURPLE}[UPDATE]${NC} $1"; }

show_help() {
    cat << HELP
CitrineOS Update Script v2.0.0

Verwendung: $0 [OPTIONEN]

Optionen:
  --version VERSION   Spezifische Version installieren
  --no-backup         Kein Backup vor Update erstellen
  --force             Update erzwingen (auch bei Fehlern)
  --help              Hilfe anzeigen

Beispiele:
  $0                  # Latest version mit Backup
  $0 --no-backup      # Ohne Backup
  $0 --version 1.2.0  # Spezifische Version
HELP
    exit 0
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --version) VERSION="$2"; shift 2 ;;
            --no-backup) NO_BACKUP=true; shift ;;
            --force) FORCE=true; shift ;;
            --help) show_help ;;
            *) log_error "Unbekannte Option: $1"; exit 1 ;;
        esac
    done
}

check_root() {
    [[ $EUID -ne 0 ]] && { log_error "Root-Rechte erforderlich!"; exit 1; }
}

create_backup() {
    [[ "$NO_BACKUP" == true ]] && return
    
    log_progress "Backup erstellen..."
    local backup_name="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR/$backup_name"
    
    cp -r "$INSTALL_DIR"/* "$BACKUP_DIR/$backup_name/" 2>/dev/null || true
    
    if command -v pg_dump &> /dev/null; then
        source "$CONFIG_FILE" 2>/dev/null || true
        pg_dump -h localhost -U "${DATABASE_USER:-citrineos_user}" "${DATABASE_NAME:-citrineos}" \
            > "$BACKUP_DIR/$backup_name/db_backup.sql" 2>/dev/null || log_warn "DB Backup fehlgeschlagen"
    fi
    
    log_ok "Backup erstellt: $backup_name"
}

update_citrineos() {
    log_progress "CitrineOS aktualisieren..."
    cd "$INSTALL_DIR"
    
    if [[ -n "$VERSION" ]]; then
        git fetch --tags
        git checkout "v$VERSION" || {
            log_error "Version $VERSION nicht gefunden"
            [[ "$FORCE" != true ]] && exit 1
        }
        log_info "Version $VERSION wird installiert"
    else
        git pull origin main || {
            log_warn "Git pull fehlgeschlagen"
            [[ "$FORCE" != true ]] && exit 1
        }
    fi
    
    log_ok "Repository aktualisiert"
}

install_dependencies() {
    log_progress "Dependencies installieren..."
    npm install --production || {
        log_warn "npm install fehlgeschlagen"
        [[ "$FORCE" != true ]] && exit 1
    }
    log_ok "Dependencies installiert"
}

build_application() {
    log_progress "Anwendung bauen..."
    npm run build || {
        log_warn "Build fehlgeschlagen"
        [[ "$FORCE" != true ]] && exit 1
    }
    log_ok "Build abgeschlossen"
}

run_migrations() {
    log_progress "Datenbank-Migrationen ausführen..."
    if [[ -f "node_modules/.bin/prisma" ]]; then
        npx prisma migrate deploy || log_warn "Migrationen fehlgeschlagen"
        npx prisma generate || log_warn "Prisma generate fehlgeschlagen"
    fi
    log_ok "Migrationen abgeschlossen"
}

restart_services() {
    log_progress "Dienste neustarten..."
    
    systemctl restart citrineos-core || log_warn "Core Restart fehlgeschlagen"
    systemctl restart citrineos-ocpp || log_warn "OCPP Restart fehlgeschlagen"
    systemctl restart citrineos-web || log_warn "Web Restart fehlgeschlagen"
    
    sleep 3
    
    log_ok "Dienste neu gestartet"
}

verify_update() {
    log_progress "Update verifizieren..."
    
    local errors=0
    for service in citrineos-core citrineos-ocpp citrineos-web; do
        if ! systemctl is-active --quiet "$service"; then
            log_error "Service $service ist nicht aktiv"
            ((errors++))
        fi
    done
    
    [[ $errors -gt 0 ]] && {
        log_warn "Update mit $errors Fehler(n) abgeschlossen"
        [[ "$FORCE" != true ]] && exit 1
    }
    
    log_ok "Update erfolgreich verifiziert"
}

main() {
    parse_args "$@"
    check_root
    
    echo ""
    log_progress "=== CitrineOS Update Start ==="
    echo ""
    
    create_backup
    update_citrineos
    install_dependencies
    build_application
    run_migrations
    restart_services
    verify_update
    
    echo ""
    log_ok "=== Update erfolgreich abgeschlossen ==="
    echo ""
}

main "$@"
