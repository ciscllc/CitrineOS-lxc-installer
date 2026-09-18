#!/bin/bash
# ============================================================
# uninstall-citrineos.sh - CitrineOS Deinstallation
# Version: 2.0.0
# ============================================================

set -

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

INSTALL_DIR="/opt/citrineos"
SYSTEMD_DIR="/etc/systemd/system"

KEEP_DATA=false
FORCE=false

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[FEHLER]${NC} $1"; }

show_help() {
    cat << HELP
CitrineOS Deinstallation Script v2.0.0

Verwendung: $0 [OPTIONEN]

Optionen:
  --keep-data   Datenbank und Backups behalten
  --force       Ohne Bestätigung deinstallieren
  --help        Hilfe anzeigen

WARNUNG: Dies entfernt CitrineOS komplett vom System!
HELP
    exit 0
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --keep-data) KEEP_DATA=true; shift ;;
            --force) FORCE=true; shift ;;
            --help) show_help ;;
            *) log_error "Unbekannte Option: $1"; exit 1 ;;
        esac
    done
}

confirm() {
    if [[ "$FORCE" == true ]]; then
        return 0
    fi
    
    echo ""
    echo -e "${RED}⚠️  WARNUNG: CitrineOS wird komplett entfernt!${NC}"
    echo ""
    read -p "Möchten Sie wirklich fortfahren? [y/N]: " confirm
    [[ "$confirm" =~ ^[Yy]$ ]] || { log_info "Abgebrochen."; exit 0; }
}

stop_services() {
    log_info "Dienste stoppen..."
    
    for service in citrineos-web citrineos-ocpp citrineos-core; do
        systemctl stop "$service" 2>/dev/null && log_ok "$service gestoppt" || log_warn "$service nicht aktiv"
    done
}

disable_services() {
    log_info "Dienste deaktivieren..."
    
    for service in citrineos-web citrineos-ocpp citrineos-core; do
        systemctl disable "$service" 2>/dev/null && log_ok "$service deaktiviert" || true
    done
}

remove_systemd_services() {
    log_info "Systemd Services entfernen..."
    
    rm -f "$SYSTEMD_DIR/citrineos-core.service"
    rm -f "$SYSTEMD_DIR/citrineos-web.service"
    rm -f "$SYSTEMD_DIR/citrineos-ocpp.service"
    
    systemctl daemon-reload
    log_ok "Systemd Services entfernt"
}

remove_nginx_config() {
    log_info "Nginx-Konfiguration entfernen..."
    
    rm -f /etc/nginx/sites-available/citrineos
    rm -f /etc/nginx/sites-enabled/citrineos
    
    nginx -t 2>/dev/null && systemctl reload nginx || true
    log_ok "Nginx-Konfiguration entfernt"
}

remove_firewall_rules() {
    log_info "Firewall-Regeln entfernen..."
    
    if command -v ufw &> /dev/null; then
        ufw delete allow 8085/tcp 2>/dev/null || true
        ufw delete allow 8080/tcp 2>/dev/null || true
        ufw delete allow 9000/tcp 2>/dev/null || true
        ufw delete allow 5432/tcp 2>/dev/null || true
        ufw delete allow 6379/tcp 2>/dev/null || true
        log_ok "Firewall-Regeln entfernt"
    else
        log_info "UFW nicht installiert"
    fi
}

remove_application() {
    log_info "Anwendung entfernen..."
    
    if [[ -d "$INSTALL_DIR" ]]; then
        rm -rf "$INSTALL_DIR"
        log_ok "Installationsverzeichnis entfernt"
    else
        log_warn "Installationsverzeichnis nicht gefunden"
    fi
}

remove_cron_jobs() {
    log_info "Cron-Jobs entfernen..."
    
    rm -f /etc/cron.daily/citrineos-backup
    log_ok "Cron-Jobs entfernt"
}

cleanup_database() {
    if [[ "$KEEP_DATA" == true ]]; then
        log_info "Datenbank wird behalten (--keep-data)"
        return
    fi
    
    log_info "Datenbank entfernen..."
    
    if command -v psql &> /dev/null; then
        sudo -u postgres psql -c "DROP DATABASE IF EXISTS citrineos;" 2>/dev/null || true
        sudo -u postgres psql -c "DROP USER IF EXISTS citrineos_user;" 2>/dev/null || true
        log_ok "Datenbank entfernt"
    else
        log_warn "psql nicht verfügbar"
    fi
}

remove_backups() {
    if [[ "$KEEP_DATA" == true ]]; then
        log_info "Backups werden behalten (--keep-data)"
        return
    fi
    
    local backup_dir="/opt/citrineos/backups"
    if [[ -d "$backup_dir" ]]; then
        rm -rf "$backup_dir"
        log_ok "Backups entfernt"
    fi
}

final_cleanup() {
    log_info "Aufräumen..."
    
    # Remove from systemd
    systemctl daemon-reload 2>/dev/null || true
    
    log_ok "Aufräumen abgeschlossen"
}

show_summary() {
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}  CitrineOS Deinstallation abgeschlossen${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    
    if [[ "$KEEP_DATA" == true ]]; then
        echo -e "${YELLOW}Hinweis: Datenbank und Backups wurden behalten.${NC}"
        echo ""
    fi
    
    echo "Folgende Komponenten wurden entfernt:"
    echo "  ✓ Systemd Services"
    echo "  ✓ Nginx-Konfiguration"
    echo "  ✓ Firewall-Regeln"
    echo "  ✓ Anwendung (/opt/citrineos)"
    echo "  ✓ Cron-Jobs"
    [[ "$KEEP_DATA" != true ]] && echo "  ✓ Datenbank"
    [[ "$KEEP_DATA" != true ]] && echo "  ✓ Backups"
    echo ""
    echo -e "${BLUE}Das System ist jetzt bereinigt.${NC}"
    echo ""
}

main() {
    parse_args "$@"
    confirm
    
    echo ""
    log_info "=== CitrineOS Deinstallation Start ==="
    echo ""
    
    stop_services
    disable_services
    remove_systemd_services
    remove_nginx_config
    remove_firewall_rules
    remove_application
    remove_cron_jobs
    cleanup_database
    remove_backups
    final_cleanup
    show_summary
}

main "$@"
