# CitrineOS LXC Installer ⚡

Ein vollständiges Installationspaket für CitrineOS (OCPP Charge Point Management System) auf Debian 12 LXC Containern.

## 📦 Paket-Inhalt

- **citrineos-scripts/** - Bash-Installationsscripts für die Kommandozeile
- **citrineos-webui/** - React Web-UI mit grafischem Installations-Wizard

---

## 🚀 Dateien auf den Server übertragen

### Option 1: SCP (Empfohlen)

```bash
# Vom lokalen Rechner ausführen
scp -r /workspace/citrineos-scripts root@DEINE_SERVER_IP:/opt/
scp -r /workspace/citrineos-webui root@DEINE_SERVER_IP:/opt/
```

### Option 2: Proxmox VE (pct push)

```bash
# Container ID ersetzen (z.B. 100)
pct push 100 /workspace/citrineos-scripts /opt/ --extract 0
pct push 100 /workspace/citrineos-webui /opt/ --extract 0
```

### Option 3: Git Clone (wenn Server Internet hat)

```bash
# Auf dem Server ausführen
cd /opt
git clone https://github.com/DEIN_REPO/citrineos-installer.git
cd citrineos-installer
```

### Option 4: Direkter Download mit wget/curl

```bash
# Auf dem Server ausführen
cd /opt
wget https://DEINE_URL/citrineos-scripts.tar.gz
tar -xzf citrineos-scripts.tar.gz
```

---

## 💻 Bash Scripts verwenden

```bash
# Auf dem Server einloggen
ssh root@DEINE_SERVER_IP

# Scripts ausführbar machen
cd /opt/citrineos-scripts
chmod +x *.sh

# Installation starten (interaktiv)
sudo ./setup-citrineos.sh

# ODER mit Parametern
sudo ./setup-citrineos.sh \
  --ip 192.168.1.100 \
  --hostname citrineos \
  --admin-user admin \
  --admin-email admin@example.com \
  --admin-password "SicheresPasswort123!"

# Update durchführen
sudo ./update-citrineos.sh

# Diagnose laufen
sudo ./diagnose-citrineos.sh --full

# Deinstallation
sudo ./uninstall-citrineos.sh
```

---

## 🎨 React Web-UI starten

### Vorbereitung auf dem Server

```bash
# Node.js 20 installieren (falls nicht vorhanden)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# In das Web-UI Verzeichnis wechseln
cd /opt/citrineos-webui
```

### Entwicklungsserver starten

```bash
# Dependencies installieren
npm install

# Development Server starten (läuft auf http://localhost:5173)
npm run dev

# Für Zugriff von außen: Host auf 0.0.0.0 setzen
npm run dev -- --host 0.0.0.0
```

### Produktions-Build erstellen

```bash
# Build für Produktion erstellen
npm run build

# Vorschau des Builds
npm run preview

# ODER mit Nginx bereitstellen
cp -r dist/* /var/www/html/
```

### Als systemd Service (für dauerhaften Betrieb)

```bash
# Service-Datei erstellen
cat > /etc/systemd/system/citrineos-webui.service << 'EOF'
[Unit]
Description=CitrineOS Web UI
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/citrineos-webui
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Service aktivieren und starten
systemctl daemon-reload
systemctl enable citrineos-webui
systemctl start citrineos-webui
```

### Mit Docker (Alternative)

```bash
# Dockerfile erstellen
cat > Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
EOF

# Container bauen und starten
docker build -t citrineos-webui .
docker run -d -p 5173:5173 --name citrineos-ui citrineos-webui
```

---

## 🔗 Zugriff auf die Web-UI

Nach dem Start ist die Web-UI verfügbar unter:

- **Lokal:** http://localhost:5173
- **Von außen:** http://DEINE_SERVER_IP:5173

**Firewall-Regel öffnen (falls UFW aktiv):**
```bash
ufw allow 5173/tcp
```

---

## 📋 Schnellübersicht der Befehle

| Aufgabe | Befehl |
|---------|--------|
| Scripts kopieren | `scp -r citrineos-scripts root@IP:/opt/` |
| Scripts ausführbar | `chmod +x *.sh` |
| Installation starten | `./setup-citrineos.sh` |
| Web-UI installieren | `npm install` |
| Web-UI starten (Dev) | `npm run dev` |
| Web-UI bauen | `npm run build` |
| Web-UI als Service | `systemctl enable citrineos-webui` |
| Logs anzeigen | `journalctl -u citrineos-webui -f` |

---

## 🔧 Systemvoraussetzungen

- **Server:** Debian 12 (Bookworm) LXC/LXD Container
- **RAM:** Mindestens 2 GB (4 GB empfohlen)
- **CPU:** 2 Kerms oder mehr
- **Speicher:** 10 GB freier Speicherplatz
- **Node.js:** Version 20+ (für Web-UI)
- **Internet:** Für Repository-Zugriff und Downloads

---

## 📞 Support & Dokumentation

- **Vollständige Anleitung:** Siehe `citrineos-scripts/SCHNELLSTART.md`
- **Konfigurationsvorlage:** `citrineos-scripts/env.example`
- **Diagnose-Tool:** `./diagnose-citrineos.sh --full`

---

## ⚠️ Wichtige Hinweise

1. **Root-Rechte erforderlich:** Alle Scripts müssen als root ausgeführt werden
2. **Backup vor Installation:** Stellen Sie sicher, dass wichtige Daten gesichert sind
3. **Firewall konfigurieren:** Vergessen Sie nicht, die benötigten Ports zu öffnen
4. **SSL/TLS:** Für Produktivbetrieb SSL-Zertifikate konfigurieren
5. **Passwörter ändern:** Standard-Passwörter sofort nach Installation ändern

---

**Version:** 2.0.0  
**Kompatibel mit:** Debian 12, Proxmox VE, LXC/LXD  
**Lizenz:** MIT
