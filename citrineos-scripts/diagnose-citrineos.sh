#!/bin/bash
# ============================================================
# diagnose-citrineos.sh - CitrineOS Diagnose & Troubleshooting
# Version: 2.0.0
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

INSTALL_DIR="/opt/citrineos"
CONFIG_FILE="$INSTALL_DIR/.env"
LOG_DIR="$INSTALL_DIR/logs"

FULL_CHECK=false
AUTO_FIX=false

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_section() { echo -e "\n${PURPLE}=== $1 ===${NC}"; }

show_help() {
    cat << HELP
CitrineOS Diagnose Script v2.0.0

Verwendung: $0 [OPTIONEN]

Optionen:
  --full      Vollständige Systemdiagnose
  --fix       Automatische Problembehebung versuchen
  --help      Hilfe anzeigen

Beispiele:
  $0          # Standard-Diagnose
  $0 --full   # Vollständige Prüfung
  $0 --fix    # Mit Auto-Repair
HELP
    exit 0
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --full) FULL_CHECK=true; shift ;;
            --fix) AUTO_FIX=true; shift ;;
            --help) show_help ;;
            *) log_error "Unbekannte Option: $1"; exit 1 ;;
        esac
    done
}

check_system_resources() {
    log_section "System-Ressourcen"
    
    # RAM
    local ram_total=$(free -m | awk 'NR==2{print $2}')
    local ram_used=$(free -m | awk 'NR==2{print $3}')
    local ram_avail=$(free -m | awk 'NR==2{print $7}')
    
    if [[ $ram_avail -lt 500 ]]; then
        log_error "RAM kritisch: ${ram_avail}MB verfügbar von ${ram_total}MB"
        [[ "$AUTO_FIX" == true ]] && log_warn "Swap erweitern empfohlen"
    else
        log_ok "RAM: ${ram_avail}MB verfügbar (${ram_used}MB verwendet)"
    fi
    
    # Disk
    local disk_used=$(df -h / | awk 'NR==2{print $5}' | tr -d '%')
    local disk_avail=$(df -h / | awk 'NR==2{print $4}')
    
    if [[ $disk_used -gt 90 ]]; then
        log_error "Disk kritisch: ${disk_used}% voll, ${disk_avail} verfügbar"
    elif [[ $disk_used -gt 80 ]]; then
        log_warn "Disk Warnung: ${disk_used}% voll"
    else
        log_ok "Disk: ${disk_used}% verwendet, ${disk_avail} verfügbar"
    fi
    
    # CPU Load
    local load=$(uptime | awk -F'load average:' '{print $2}' | cut -d',' -f1 | tr -d ' ')
    log_ok "CPU Load: $load"
}

check_services() {
    log_section "Dienste-Status"
    
    for service in citrineos-core citrineos-ocpp citrineos-web postgresql redis-server nginx; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            log_ok "$service: aktiv"
        else
            log_error "$service: inaktiv"
            if [[ "$AUTO_FIX" == true ]]; then
                log_info "Versuche $service zu starten..."
                systemctl start "$service" 2>/dev/null && log_ok "$service gestartet" || log_error "Start fehlgeschlagen"
            fi
        fi
    done
}

check_network_ports() {
    log_section "Netzwerk-Ports"
    
    declare -A ports=(
        [8085]="Admin Web"
        [8080]="OCPP WebSocket"
        [9000]="OCPP Secure WS"
        [5432]="PostgreSQL"
        [6379]="Redis"
        [22]="SSH"
    )
    
    for port in "${!ports[@]}"; do
        if ss -tlnp | grep -q ":$port "; then
            log_ok "Port $port (${ports[$port]}): offen"
        else
            log_warn "Port $port (${ports[$port]}): nicht erreichbar"
        fi
    done
}

check_database() {
    log_section "Datenbank-Verbindung"
    
    if [[ -f "$CONFIG_FILE" ]]; then
        source "$CONFIG_FILE" 2>/dev/null || true
    fi
    
    local db_host="${DATABASE_HOST:-localhost}"
    local db_user="${DATABASE_USER:-citrineos_user}"
    local db_name="${DATABASE_NAME:-citrineos}"
    
    if command -v psql &> /dev/null; then
        if sudo -u postgres psql -h "$db_host" -U "$db_user" -d "$db_name" -c "SELECT 1;" &>/dev/null; then
            log_ok "PostgreSQL Verbindung: erfolgreich"
            
            # Tables prüfen
            local table_count=$(sudo -u postgres psql -h "$db_host" -U "$db_user" -d "$db_name" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ')
            log_ok "Datenbank-Tabellen: $table_count"
        else
            log_error "PostgreSQL Verbindung: fehlgeschlagen"
            [[ "$AUTO_FIX" == true ]] && log_info "PostgreSQL Service prüfen: systemctl status postgresql"
        fi
    else
        log_warn "psql nicht installiert"
    fi
}

check_logs() {
    log_section "Log-Analyse"
    
    local error_count=0
    
    # Systemd Logs
    for service in citrineos-core citrineos-ocpp citrineos-web; do
        local errors=$(journalctl -u "$service" --since "24 hours ago" 2>/dev/null | grep -ci "error\|fatal\|critical" || echo "0")
        if [[ $errors -gt 0 ]]; then
            log_warn "$service: $errors Fehler in den letzten 24h"
            ((error_count += errors))
        else
            log_ok "$service: keine kritischen Fehler"
        fi
    done
    
    # Log Files
    if [[ -d "$LOG_DIR" ]]; then
        local log_files=$(find "$LOG_DIR" -name "*.log" -mtime -1 2>/dev/null | wc -l)
        log_ok "Log-Dateien (24h): $log_files"
    fi
    
    [[ $error_count -gt 10 ]] && log_error "Viele Fehler gefunden - manuelle Prüfung empfohlen"
}

check_ssl_certificate() {
    log_section "SSL-Zertifikat"
    
    local cert_path="/etc/ssl/certs/citrineos.crt"
    
    if [[ -f "$cert_path" ]]; then
        local expiry=$(openssl x509 -enddate -noout -in "$cert_path" 2>/dev/null | cut -d= -f2)
        local expiry_epoch=$(date -d "$expiry" +%s 2>/dev/null || echo "0")
        local now_epoch=$(date +%s)
        local days_left=$(( (expiry_epoch - now_epoch) / 86400 ))
        
        if [[ $days_left -lt 0 ]]; then
            log_error "Zertifikat abgelaufen seit $((-days_left)) Tagen"
            [[ "$AUTO_FIX" == true ]] && log_info "Erneuern mit: certbot renew"
        elif [[ $days_left -lt 30 ]]; then
            log_warn "Zertifikat läuft in $days_left Tagen ab"
        else
            log_ok "Zertifikat gültig für $days_left Tage"
        fi
    else
        log_info "Kein SSL-Zertifikat gefunden (optional)"
    fi
}

check_firewall() {
    log_section "Firewall-Status"
    
    if command -v ufw &> /dev/null; then
        if ufw status | grep -q "Status: active"; then
            log_ok "UFW Firewall: aktiv"
            ufw status | grep -E "ALLOW|DENY" | head -10 | while read line; do
                echo "    $line"
            done
        else
            log_warn "UFW Firewall: inaktiv"
        fi
    else
        log_info "UFW nicht installiert"
    fi
}

auto_fix_common_issues() {
    if [[ "$AUTO_FIX" != true ]]; then
        return
    fi
    
    log_section "Automatische Reparatur"
    
    # Restart failed services
    for service in citrineos-core citrineos-ocpp citrineos-web postgresql redis-server nginx; do
        if ! systemctl is-active --quiet "$service" 2>/dev/null; then
            log_info "Starte $service..."
            systemctl restart "$service" 2>/dev/null && log_ok "$service neu gestartet" || true
        fi
    done
    
    # Fix permissions
    if [[ -d "$INSTALL_DIR" ]]; then
        log_info "Repariere Berechtigungen..."
        chmod -R 755 "$INSTALL_DIR" 2>/dev/null || true
        log_ok "Berechtigungen korrigiert"
    fi
    
    # Clear old logs
    if [[ -d "$LOG_DIR" ]]; then
        find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null || true
        log_ok "Alte Logs bereinigt"
    fi
}

generate_report() {
    log_section "Diagnose-Bericht"
    
    echo -e "${CYAN}Generiere Zusammenfassung...${NC}"
    echo ""
    echo "======================================"
    echo "  CitrineOS Diagnose-Bericht"
    echo "  $(date)"
    echo "======================================"
    echo ""
    echo "Hostname: $(hostname)"
    echo "IP: $(hostname -I | awk '{print $1}')"
    echo "Uptime: $(uptime -p 2>/dev/null || uptime)"
    echo ""
    echo "Services:"
    for s in citrineos-core citrineos-ocpp citrineos-web; do
        status=$(systemctl is-active $s 2>/dev/null || echo "unknown")
        echo "  - $s: $status"
    done
    echo ""
}

main() {
    parse_args "$@"
    
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║   CitrineOS Diagnose v2.0.0          ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════╝${NC}"
    echo ""
    
    check_system_resources
    check_services
    check_network_ports
    check_database
    check_logs
    check_ssl_certificate
    check_firewall
    
    [[ "$FULL_CHECK" == true ]] && {
        log_section "Erweiterte Prüfung"
        log_info "Prüfe Git Repository..."
        cd "$INSTALL_DIR" 2>/dev/null && git status --short | head -5 || log_warn "Kein Git Repo"
    }
    
    auto_fix_common_issues
    generate_report
    
    echo -e "${GREEN}Diagnose abgeschlossen.${NC}"
    echo ""
}

main "$@"
