import { InstallerState } from '../types'

interface Props {
  state: InstallerState
  onStartInstall: () => void
  onBack: () => void
}

export default function SummaryStep({ state, onStartInstall, onBack }: Props) {
  const generateBashScript = () => {
    const { network, database, adminUser, system, ocpp } = state
    return `#!/bin/bash
# CitrineOS Installation Script
# Generated: ${new Date().toISOString()}

# Konfiguration
export HOSTNAME="${network.hostname}"
export IP_ADDRESS="${network.ipAddress}"
export DB_TYPE="${database.type}"
export DB_HOST="${database.host}"
export DB_PORT="${database.port}"
export DB_NAME="${database.database}"
export DB_USER="${database.username}"
export DB_PASSWORD="${database.password}"
export ADMIN_USER="${adminUser.username}"
export ADMIN_EMAIL="${adminUser.email}"
export TIMEZONE="${system.timezone}"
export SSL_ENABLED="${system.sslEnabled}"
export OCPP_WS_PORT="${ocpp.websocketPort}"
export OCPP_WSS_PORT="${ocpp.wsPort}"

echo "Starte CitrineOS Installation..."
echo "Hostname: $HOSTNAME"
echo "IP: $IP_ADDRESS"
echo ""

# System aktualisieren
apt-get update && apt-get upgrade -y

# Dependencies installieren
apt-get install -y curl wget git postgresql redis-server nginx ufw

# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ... weitere Schritte folgen im vollständigen Script

echo "Installation abgeschlossen!"`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('In Zwischenablage kopiert!')
    } catch (err) {
      console.error('Kopieren fehlgeschlagen', err)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">📋 Zusammenfassung</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-purple-400 mb-2">🌐 Netzwerk</h3>
          <p className="text-sm text-gray-300">Hostname: {state.network.hostname}</p>
          <p className="text-sm text-gray-300">IP: {state.network.ipAddress || 'auto'}</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-purple-400 mb-2">🗄️ Datenbank</h3>
          <p className="text-sm text-gray-300">Typ: {state.database.type}</p>
          <p className="text-sm text-gray-300">DB: {state.database.database}</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-purple-400 mb-2">👤 Admin</h3>
          <p className="text-sm text-gray-300">User: {state.adminUser.username}</p>
          <p className="text-sm text-gray-300">Email: {state.adminUser.email}</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-purple-400 mb-2">⚙️ System</h3>
          <p className="text-sm text-gray-300">SSL: {state.system.sslEnabled ? 'Ja' : 'Nein'}</p>
          <p className="text-sm text-gray-300">Log-Level: {state.system.logLevel}</p>
        </div>
      </div>

      <div className="card bg-gray-900">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-white">📜 Bash-Script Vorschau</h3>
          <button onClick={() => copyToClipboard(generateBashScript())} className="text-xs px-3 py-1 bg-purple-600 rounded hover:bg-purple-700">📋 Kopieren</button>
        </div>
        <pre className="text-xs text-green-400 overflow-auto max-h-48 p-2 bg-black/50 rounded">
          {generateBashScript().split('\n').slice(0, 15).join('\n')}
          <span className="text-gray-500">...</span>
        </pre>
      </div>

      <div className="card bg-yellow-900/20 border border-yellow-700">
        <p className="text-yellow-300 text-sm">⚠️ Bitte überprüfen Sie alle Einstellungen vor dem Start der Installation.</p>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-2 text-gray-400 hover:text-white">← Zurück</button>
        <button onClick={onStartInstall} className="btn-gradient px-8 py-3 text-lg">🚀 Installation starten</button>
      </div>
    </div>
  )
}
