#!/bin/bash
# ============================================================
# setup-citrineos.sh - CitrineOS Hauptinstallation
# Version: 2.0.0
# ============================================================
# Verwendung:
#   ./setup-citrineos.sh [OPTIONEN]
# ============================================================

set -e

# Farbdefinitionen
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Konfiguration
INSTALL_DIR="/opt/citrineos"
CONFIG_FILE="$INSTALL_DIR/.env"
LOG_DIR="$INSTALL_DIR/logs"
BACKUP_DIR="$INSTALL_DIR/backups"
SYSTEMD_DIR="/etc/systemd/system"

# Standardwerte
SERVER_HOSTNAME="citrineos-server"
SERVER_IP=""
ADMIN_USER="admin"
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
DB_PASSWORD=""
TIMEZONE="Europe/Berlin"
SSL_ENABLED=false

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[FEHLER]${NC} $1"; }
log_progress() { echo -e "${PURPLE}[FORTSCHRITT]${NC} $1"; }

show_help() {
    cat << EOF
CitrineOS Installation Script v2.0.0

Verwendung: $0 [OPTIONEN]

Optionen:
  --ip IP_ADDRESS        IP-Adresse des Servers
  --hostname HOSTNAME    Hostname des Servers
  --admin-user USERNAME  Admin-Benutzername
  --admin-email EMAIL    Admin-E-Mail
  --admin-passwort PASS  Admin-Passwort
  --db-passwort PASS     Datenbank-Passwort
  --timezone ZONE        Zeitzone (default: Europe/Berlin)
  --ssl                  SSL/TLS aktivieren
  --help                 Hilfe anzeigen

Beispiel:
  $0 --ip 192.168.1.100 --hostname citrineos --admin-user admin
EOF
    exit 0
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --ip) SERVER_IP="$2"; shift 2 ;;
            --hostname) SERVER_HOSTNAME="$2"; shift 2 ;;
            --admin-user) ADMIN_USER="$2"; shift 2 ;;
            --admin-email) ADMIN_EMAIL="$2"; shift 2 ;;
            --admin-passwort) ADMIN_PASSWORD="$2"; shift 2 ;;
            --db-passwort) DB_PASSWORD="$2"; shift 2 ;;
            --timezone) TIMEZONE="$2"; shift 2 ;;
            --ssl) SSL_ENABLED=true; shift ;;
            --help) show_help ;;
            *) log_error "Unbekannte Option: $1"; exit 1 ;;
        esac
    done
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Dieses Script muss als root ausgeführt werden!"
        exit 1
    fi
    log_ok "Root-Rechte bestätigt"
}

get_user_input() {
    echo ""
    echo -e "${PURPLE}============================================${NC}"
    echo -e "${PURPLE}  CitrineOS Installation - Konfiguration${NC}"
    echo -e "${PURPLE}============================================${NC}"
    echo ""

    if [[ -z "$SERVER_IP" ]]; then
        read -p "IP-Adresse des Servers [auto]: " ip_input
        [[ -z "$ip_input" ]] && ip_input=$(hostname -I | awk '{print $1}')
        SERVER_IP="$ip_input"
    fi

    read -p "Hostname [$SERVER_HOSTNAME]: " h_input
    [[ -n "$h_input" ]] && SERVER_HOSTNAME="$h_input"

    read -p "Admin-Benutzername [$ADMIN_USER]: " u_input
    [[ -n "$u_input" ]] && ADMIN_USER="$u_input"

    if [[ -z "$ADMIN_EMAIL" ]]; then
        read -p "Admin-E-Mail: " ADMIN_EMAIL
        [[ -z "$ADMIN_EMAIL" ]] && { log_error "E-Mail erforderlich!"; exit 1; }
    fi

    if [[ -z "$ADMIN_PASSWORD" ]]; then
        read -sp "Admin-Passwort [auto]: " pw_input
        echo ""
        [[ -z "$pw_input" ]] && ADMIN_PASSWORD=$(openssl rand -base64 16) || ADMIN_PASSWORD="$pw_input"
    fi

    if [[ -z "$DB_PASSWORD" ]]; then
        read -sp "DB-Passwort [auto]: " db_input
        echo ""
        [[ -z "$db_input" ]] && DB_PASSWORD=$(openssl rand -base64 16) || DB_PASSWORD="$db_input"
    fi

    read -p "SSL aktivieren? [y/N]: " ssl_input
    [[ "$ssl_input" =~ ^[Yy]$ ]] && SSL_ENABLED=true

    log_ok "Konfiguration abgeschlossen"
}

check_requirements() {
    log_progress "Systemvoraussetzungen prüfen..."
    local ram=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    local disk=$(df -m / | awk 'NR==2{print $4}')
    
    [[ $ram -lt 2000 ]] && log_warn "Wenig RAM: ${ram}MB" || log_ok "RAM: ${ram}MB"
    [[ $disk -lt 10000 ]] && log_warn "Wenig Disk: ${disk}MB" || log_ok "Disk: ${disk}MB"
    
    [[ ! -f /etc/debian_version ]] && { log_error "Nur Debian unterstützt!"; exit 1; }
    log_ok "Debian erkannt"
}

update_system() {
    log_progress "System aktualisieren..."
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq
    log_ok "System aktualisiert"
}

install_dependencies() {
    log_progress "Abhängigkeiten installieren..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
        curl wget git nginx postgresql postgresql-contrib redis-server \
        nodejs npm build-essential ssl-cert ufw fail2ban cron
    log_ok "Abhängigkeiten installiert"
}

install_nodejs() {
    log_progress "Node.js 20 installieren..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
    log_ok "Node.js $(node --version) installiert"
}

setup_postgresql() {
    log_progress "PostgreSQL konfigurieren..."
    systemctl enable postgresql
    systemctl start postgresql
    
    sudo -u postgres psql -c "CREATE DATABASE citrineos;" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE USER citrineos_user WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE citrineos TO citrineos_user;" 2>/dev/null || true
    sudo -u postgres psql -c "ALTER DATABASE citrineos OWNER TO citrineos_user;" 2>/dev/null || true
    
    log_ok "PostgreSQL konfiguriert"
}

setup_redis() {
    log_progress "Redis konfigurieren..."
    systemctl enable redis-server
    systemctl start redis-server
    log_ok "Redis konfiguriert"
}

clone_citrineos() {
    log_progress "CitrineOS klonen..."
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    if [[ ! -d ".git" ]]; then
        git clone https://github.com/citrineos/citrineos.git . 2>/dev/null || {
            log_warn "Git Clone fehlgeschlagen, erstelle Verzeichnis"
            mkdir -p src packages
        }
    fi
    
    log_ok "CitrineOS Verzeichnis bereit"
}

create_env_file() {
    log_progress "Konfigurationsdatei erstellen..."
    mkdir -p "$LOG_DIR" "$BACKUP_DIR"
    
    cat > "$CONFIG_FILE" << ENVFILE
# CitrineOS Environment Configuration
# Generated: $(date)

# Application
NODE_ENV=production
PORT=8085
HOST=$SERVER_IP

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=citrineos
DATABASE_USER=citrineos_user
DATABASE_PASSWORD=$DB_PASSWORD

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Admin
ADMIN_USERNAME=$ADMIN_USER
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD_HASH=$(echo -n "$ADMIN_PASSWORD" | openssl passwd -6 -stdin)

# OCPP
OCPP_WEBSOCKET_PORT=8080
OCPP_SECURE_WEBSOCKET_PORT=9000

# Security
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# SSL
SSL_ENABLED=$SSL_ENABLED
SSL_CERT_PATH=/etc/ssl/certs/citrineos.crt
SSL_KEY_PATH=/etc/ssl/private/citrineos.key

# Logging
LOG_LEVEL=info
LOG_DIR=$LOG_DIR

# Paths
INSTALL_DIR=$INSTALL_DIR
BACKUP_DIR=$BACKUP_DIR
ENVFILE

    chmod 600 "$CONFIG_FILE"
    log_ok "Konfigurationsdatei erstellt"
}

create_systemd_services() {
    log_progress "Systemd Services erstellen..."
    
    cat > "$SYSTEMD_DIR/citrineos-core.service" << SVCFILE
[Unit]
Description=CitrineOS Core Service
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node dist/core/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$CONFIG_FILE

[Install]
WantedBy=multi-user.target
SVCFILE

    cat > "$SYSTEMD_DIR/citrineos-web.service" << SVCFILE
[Unit]
Description=CitrineOS Web Interface
After=network.target postgresql.service redis-server.service citrineos-core.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node dist/web/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$CONFIG_FILE

[Install]
WantedBy=multi-user.target
SVCFILE

    cat > "$SYSTEMD_DIR/citrineos-ocpp.service" << SVCFILE
[Unit]
Description=CitrineOS OCPP WebSocket Server
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node dist/ocpp/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$CONFIG_FILE

[Install]
WantedBy=multi-user.target
SVCFILE

    systemctl daemon-reload
    systemctl enable citrineos-core citrineos-web citrineos-ocpp
    log_ok "Systemd Services erstellt"
}

setup_firewall() {
    log_progress "Firewall konfigurieren..."
    
    ufw --force enable || true
    ufw default deny incoming
    ufw default allow outgoing
    
    ufw allow ssh
    ufw allow 8085/tcp  # Admin Web
    ufw allow 8080/tcp  # OCPP WS
    ufw allow 9000/tcp  # OCPP WSS
    ufw allow 5432/tcp  # PostgreSQL
    ufw allow 6379/tcp  # Redis
    
    log_ok "Firewall konfiguriert"
}

setup_nginx() {
    log_progress "Nginx konfigurieren..."
    
    cat > /etc/nginx/sites-available/citrineos << NGINXFILE
server {
    listen 80;
    server_name $SERVER_HOSTNAME $SERVER_IP;

    location / {
        proxy_pass http://localhost:8085;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /ocpp {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }
}
NGINXFILE

    ln -sf /etc/nginx/sites-available/citrineos /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl restart nginx
    
    log_ok "Nginx konfiguriert"
}

setup_backup_cron() {
    log_progress "Backup Cron-Job einrichten..."
    
    cat > /etc/cron.daily/citrineos-backup << BACKUPSCRIPT
#!/bin/bash
BACKUP_DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DEST="$BACKUP_DIR/pg_backup_\${BACKUP_DATE}.sql"
pg_dump -h localhost -U citrineos_user citrineos > "\$BACKUP_DEST"
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
BACKUPSCRIPT

    chmod +x /etc/cron.daily/citrineos-backup
    log_ok "Backup Cron-Job eingerichtet"
}

start_services() {
    log_progress "Dienste starten..."
    
    systemctl start citrineos-core
    systemctl start citrineos-ocpp
    systemctl start citrineos-web
    
    sleep 5
    
    systemctl status citrineos-core --no-pager || log_warn "Core Service Status unbekannt"
    systemctl status citrineos-ocpp --no-pager || log_warn "OCPP Service Status unbekannt"
    systemctl status citrineos-web --no-pager || log_warn "Web Service Status unbekannt"
    
    log_ok "Dienste gestartet"
}

show_summary() {
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}  CitrineOS Installation erfolgreich!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "${CYAN}Zugangsdaten:${NC}"
    echo "  URL:       http://$SERVER_IP:8085"
    echo "  Benutzer:  $ADMIN_USER"
    echo "  Passwort:  $ADMIN_PASSWORD"
    echo ""
    echo -e "${CYAN}Wichtige Pfade:${NC}"
    echo "  Installation: $INSTALL_DIR"
    echo "  Konfiguration: $CONFIG_FILE"
    echo "  Logs: $LOG_DIR"
    echo "  Backups: $BACKUP_DIR"
    echo ""
    echo -e "${CYAN}Ports:${NC}"
    echo "  8085 - Admin Web Interface"
    echo "  8080 - OCPP WebSocket"
    echo "  9000 - OCPP Secure WebSocket"
    echo "  5432 - PostgreSQL"
    echo "  6379 - Redis"
    echo ""
    echo -e "${YELLOW}Bitte notiere dir das Passwort - es wird nicht wieder angezeigt!${NC}"
    echo ""
}

main() {
    parse_args "$@"
    check_root
    get_user_input
    check_requirements
    update_system
    install_dependencies
    install_nodejs
    setup_postgresql
    setup_redis
    clone_citrineos
    create_env_file
    create_systemd_services
    setup_firewall
    setup_nginx
    setup_backup_cron
    start_services
    show_summary
}

main "$@"
