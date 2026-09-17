# CitrineOS Schnellstart-Anleitung

## 📦 Paket-Inhalt

| Datei | Beschreibung |
|-------|-------------|
| `setup-citrineos.sh` | Hauptinstallationsscript |
| `update-citrineos.sh` | Update-Script mit Backup |
| `diagnose-citrineos.sh` | Diagnose & Troubleshooting |
| `uninstall-citrineos.sh` | Deinstallationsscript |
| `env.example` | Konfigurationsvorlage |

---

## 🚀 Schnellstart (5 Minuten)

### 1. Scripts herunterladen und vorbereiten

```bash
# In das Verzeichnis wechseln
cd /opt

# Scripts ausführbar machen
chmod +x *.sh
```

### 2. Installation starten

**Interaktiv (empfohlen für Erstinstallation):**
```bash
sudo ./setup-citrineos.sh
```

**Mit Parametern (für Automatisierung):**
```bash
sudo ./setup-citrineos.sh \
  --ip 192.168.1.100 \
  --hostname citrineos \
  --admin-user admin \
  --admin-email admin@example.com
```

### 3. Warten bis die Installation abgeschlossen ist

Die Installation dauert ca. 3-5 Minuten abhängig von der Internetverbindung.

### 4. Zugangsdaten notieren

Am Ende der Installation werden Zugangsdaten angezeigt:
```
URL:       http://192.168.1.100:8085
Benutzer:  admin
Passwort:  [generiertes Passwort]
```

---

## 📁 Installationspfade

```
/opt/citrineos/
├── .env                    # Konfiguration (sensibel!)
├── logs/                   # Anwendungslogs
├── backups/                # Automatische Backups
├── src/                    # Quellcode
└── dist/                   # Kompilierter Code

/etc/systemd/system/
├── citrineos-core.service  # Core Service
├── citrineos-web.service   # Web Interface
└── citrineos-ocpp.service  # OCPP WebSocket

/etc/nginx/sites-available/
└── citrineos               # Nginx Konfiguration
```

---

## 🔧 Nützliche Befehle

### Dienste verwalten
```bash
# Status aller Dienste
systemctl status citrineos-*

# Dienste neustarten
sudo systemctl restart citrineos-core
sudo systemctl restart citrineos-web
sudo systemctl restart citrineos-ocpp

# Alle Dienste neu starten
sudo systemctl restart citrineos-core citrineos-web citrineos-ocpp
```

### Logs anzeigen
```bash
# Live-Logs aller Dienste
journalctl -u citrineos-core -f
journalctl -u citrineos-web -f
journalctl -u citrineos-ocpp -f

# Letzte 100 Einträge
journalctl -u citrineos-core -n 100

# Logs der letzten Stunde
journalctl -u citrineos-core --since "1 hour ago"
```

### Datenbank-Operationen
```bash
# PostgreSQL verbinden
sudo -u postgres psql -d citrineos

# Backup manuell erstellen
pg_dump -h localhost -U citrineos_user citrineos > backup.sql

# Backup wiederherstellen
psql -h localhost -U citrineos_user citrineos < backup.sql
```

### Wartung
```bash
# Update durchführen
sudo ./update-citrineos.sh

# Diagnose laufen lassen
sudo ./diagnose-citrineos.sh

# Mit Auto-Repair
sudo ./diagnose-citrineos.sh --fix
```

### OCPP Testing
```bash
# WebSocket Test mit wscat
wscat -c ws://localhost:8080/ocpp/test123

# Port prüfen
netstat -tlnp | grep 8080
```

---

## 🔐 Zugangsdaten (Standard)

| Komponente | Benutzer | Passwort |
|------------|----------|----------|
| Admin Web | admin | (wird bei Installation generiert) |
| PostgreSQL | citrineos_user | (in .env gespeichert) |
| Redis | - | (kein Passwort, local only) |

---

## 🛡️ Sicherheit

### Firewall konfigurieren
```bash
# UFW Status prüfen
sudo ufw status

# Nur notwendige Ports öffnen
sudo ufw allow ssh
sudo ufw allow 80        # HTTP (Nginx)
sudo ufw allow 443       # HTTPS (nach SSL Setup)
sudo ufw enable
```

### SSL/TLS einrichten (Let's Encrypt)
```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx

# Zertifikat beziehen
sudo certbot --nginx -d citrineos.example.com

# Auto-Renewal testen
sudo certbot renew --dry-run
```

### Regelmäßige Updates
```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# CitrineOS aktualisieren
sudo ./update-citrineos.sh
```

---

## 🔍 Troubleshooting

### Dienst startet nicht
```bash
# Status prüfen
systemctl status citrineos-core

# Logs ansehen
journalctl -u citrineos-core -n 50

# Manuell starten
cd /opt/citrineos && node dist/core/index.js
```

### Datenbank-Verbindungsfehler
```bash
# PostgreSQL Status
systemctl status postgresql

# Verbindung testen
sudo -u postgres psql -c "SELECT 1;"

# User prüfen
sudo -u postgres psql -c "\du citrineos_user"
```

### Speicherplatz knapp
```bash
# Disk usage prüfen
df -h

# Alte Logs bereinigen
find /opt/citrineos/logs -name "*.log" -mtime +30 -delete

# Docker Cleanup (falls verwendet)
docker system prune -af
```

### WebSocket-Verbindung schlägt fehl
```bash
# Port prüfen
ss -tlnp | grep 8080

# Firewall Regeln
sudo ufw status | grep 8080

# Nginx Config testen
sudo nginx -t
```

---

## ✅ Checkliste nach Installation

- [ ] Zugangsdaten sicher gespeichert
- [ ] Admin-Passwort geändert (erste Anmeldung)
- [ ] Firewall konfiguriert
- [ ] SSL-Zertifikat eingerichtet (Produktivbetrieb)
- [ ] Backup-Strategie überprüft
- [ ] Monitoring eingerichtet
- [ ] Dokumentierte Notfall-Prozeduren

---

## 📞 Support & Ressourcen

- **Offizielle Dokumentation:** https://github.com/citrineos/citrineos
- **OCPP Spezifikation:** https://openchargealliance.org
- **Community Forum:** https://github.com/citrineos/citrineos/discussions

---

## ⚠️ Wichtige Hinweise

1. **.env Datei niemals committen** - enthält sensible Daten
2. **Regelmäßige Backups** - Cron-Job ist vorkonfiguriert
3. **Passwörter ändern** - direkt nach erster Installation
4. **Monitoring einrichten** - für Produktivbetrieb empfohlen
5. **Updates testen** - vor Produktiveinsatz in Testumgebung

---

*Version: 2.0.0 | Zuletzt aktualisiert: 17.09.2026*
