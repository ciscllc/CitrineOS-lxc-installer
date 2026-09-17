export default function DocumentationPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-white">📚 Dokumentation</h2>

      {/* Übersicht */}
      <section className="card">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">📖 Übersicht</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-2">Architektur</h4>
            <p className="text-sm text-gray-300">CitrineOS besteht aus drei Hauptkomponenten: Core Service, Web Interface und OCPP WebSocket Server.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Systemanforderungen</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Debian 12 (Bookworm)</li>
              <li>• 2GB RAM minimum</li>
              <li>• 10GB Speicherplatz</li>
              <li>• Node.js 24+</li>
            </ul>
          </div>
        </div>
        <table className="w-full mt-4 text-sm">
          <thead className="border-b border-gray-700">
            <tr className="text-left text-gray-400">
              <th className="py-2">Dienst</th>
              <th>Port</th>
              <th>Beschreibung</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-800"><td className="py-2">citrineos-core</td><td>-</td><td>Core Business Logic</td></tr>
            <tr className="border-b border-gray-800"><td className="py-2">citrineos-web</td><td>8085</td><td>Admin Web Interface</td></tr>
            <tr className="border-b border-gray-800"><td className="py-2">citrineos-ocpp</td><td>8080/9000</td><td>OCPP WebSocket Server</td></tr>
            <tr><td className="py-2">postgresql</td><td>5432</td><td>Datenbank</td></tr>
          </tbody>
        </table>
      </section>

      {/* Pfadstruktur */}
      <section className="card">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">📁 Pfadstruktur</h3>
        <pre className="text-xs text-green-400 bg-black/50 p-4 rounded-lg overflow-auto">
{`/opt/citrineos/
├── .env                    # Konfiguration
├── logs/                   # Anwendungslogs
├── backups/                # Automatische Backups
├── src/                    # Quellcode
│   ├── core/               # Core Service
│   ├── web/                # Web Interface
│   └── ocpp/               # OCPP Handler
└── dist/                   # Kompilierter Code`}
        </pre>
      </section>

      {/* LXC Vorbereitung */}
      <section className="card">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">🐧 LXC Vorbereitung</h3>
        <ol className="list-decimal list-inside text-sm text-gray-300 space-y-2">
          <li>LXC Container erstellen (Proxmox/LXD)</li>
          <li>System aktualisieren: apt update && apt upgrade</li>
          <li>Firewall konfigurieren: ufw enable</li>
          <li>Statische IP konfigurieren</li>
          <li>SSH absichern (Key-based auth)</li>
          <li>Hostname & DNS setzen</li>
          <li>Swap-Space einrichten (2GB empfohlen)</li>
          <li>Monitoring & Backups konfigurieren</li>
        </ol>
      </section>

      {/* Befehlsreferenz */}
      <section className="card">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">⌨️ Befehlsreferenz</h3>
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium text-white">Dienste verwalten</h4>
            <code className="text-green-400 block mt-1">systemctl status citrineos-*</code>
            <code className="text-green-400 block">systemctl restart citrineos-core</code>
          </div>
          <div>
            <h4 className="font-medium text-white">Logs anzeigen</h4>
            <code className="text-green-400 block mt-1">journalctl -u citrineos-core -f</code>
            <code className="text-green-400 block">tail -f /opt/citrineos/logs/*.log</code>
          </div>
          <div>
            <h4 className="font-medium text-white">Datenbank Operationen</h4>
            <code className="text-green-400 block mt-1">sudo -u postgres psql -d citrineos</code>
            <code className="text-green-400 block">pg_dump -U citrineos_user citrineos > backup.sql</code>
          </div>
        </div>
      </section>

      {/* Fehlerbehebung */}
      <section className="card">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">🔧 Fehlerbehebung</h3>
        <div className="space-y-4 text-sm">
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-white">1. Dienst startet nicht</h4>
            <p className="text-gray-300 mt-1">Prüfen: systemctl status [dienst] und journalctl -xe</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-medium text-white">2. WebSocket-Verbindung schlägt fehl</h4>
            <p className="text-gray-300 mt-1">Firewall-Regeln prüfen: ufw status | grep 8080</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-white">3. Datenbank-Fehler</h4>
            <p className="text-gray-300 mt-1">PostgreSQL Status: systemctl status postgresql</p>
          </div>
        </div>
      </section>
    </div>
  )
}
