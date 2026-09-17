import { useState } from 'react'

const SETUP_SCRIPT = `#!/bin/bash
# CitrineOS Setup Script
curl -O https://raw.githubusercontent.com/citrineos/installer/main/setup-citrineos.sh
chmod +x setup-citrineos.sh
sudo ./setup-citrineos.sh`

const UPDATE_SCRIPT = `#!/bin/bash
# CitrineOS Update Script
curl -O https://raw.githubusercontent.com/citrineos/installer/main/update-citrineos.sh
chmod +x update-citrineos.sh
sudo ./update-citrineos.sh`

const CODE_BLOCKS = [
  { name: 'Setup Script', code: SETUP_SCRIPT, lang: 'bash' },
  { name: 'Update Script', code: UPDATE_SCRIPT, lang: 'bash' },
  { name: 'Diagnose Script', code: `sudo ./diagnose-citrineos.sh --full`, lang: 'bash' },
  { name: 'Uninstall', code: `sudo ./uninstall-citrineos.sh --keep-data`, lang: 'bash' },
]

export default function DeploymentPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-white">📥 Download & Deployment</h2>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-700 pb-2">
        {['Übersicht', 'Scripts', 'Config Template', 'Anleitung'].map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} className={`tab-button ${activeTab === i ? 'active' : 'inactive'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-white mb-4">📦 Paket-Inhalt</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• setup-citrineos.sh - Hauptinstallation</li>
              <li>• update-citrineos.sh - Update mit Backup</li>
              <li>• diagnose-citrineos.sh - Diagnose-Tool</li>
              <li>• uninstall-citrineos.sh - Deinstallation</li>
              <li>• env.example - Konfigurationsvorlage</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-4">📍 Installationspfade</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400">Installation:</span><code className="text-green-400 ml-2">/opt/citrineos/</code></div>
              <div><span className="text-gray-400">Config:</span><code className="text-green-400 ml-2">/opt/citrineos/.env</code></div>
              <div><span className="text-gray-400">Logs:</span><code className="text-green-400 ml-2">/opt/citrineos/logs/</code></div>
              <div><span className="text-gray-400">Backups:</span><code className="text-green-400 ml-2">/opt/citrineos/backups/</code></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4">
          {CODE_BLOCKS.map((block, i) => (
            <div key={i} className="card">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">{block.name}</h4>
                <button onClick={() => copyToClipboard(block.code)} className="text-xs px-3 py-1 bg-purple-600 rounded hover:bg-purple-700">
                  {copied ? '✓ Kopiert' : '📋 Kopieren'}
                </button>
              </div>
              <pre className="text-xs text-green-400 bg-black/50 p-4 rounded overflow-auto">
                <code>{block.code}</code>
              </pre>
            </div>
          ))}
        </div>
      )}

      {activeTab === 2 && (
        <div className="card">
          <h4 className="font-medium text-white mb-4">Konfigurationsvorlage (.env)</h4>
          <pre className="text-xs text-gray-300 bg-black/50 p-4 rounded overflow-auto max-h-96">
{`# Application
NODE_ENV=production
PORT=8085

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=citrineos
DATABASE_USER=citrineos_user
DATABASE_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OCPP
OCPP_WEBSOCKET_PORT=8080
OCPP_SECURE_WEBSOCKET_PORT=9000

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# SSL
SSL_ENABLED=false`}
          </pre>
        </div>
      )}

      {activeTab === 3 && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-white mb-4">📋 Installation via SCP</h3>
            <ol className="list-decimal list-inside text-sm text-gray-300 space-y-2">
              <li>Scripts herunterladen</li>
              <li>Mit SCP auf Server kopieren: <code className="text-green-400">scp *.sh user@server:/opt/</code></li>
              <li>Auf Server verbinden: <code className="text-green-400">ssh user@server</code></li>
              <li>Scripts ausführbar machen: <code className="text-green-400">chmod +x *.sh</code></li>
              <li>Installation starten: <code className="text-green-400">sudo ./setup-citrineos.sh</code></li>
            </ol>
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-4">🖥️ Proxmox Console</h3>
            <p className="text-sm text-gray-300 mb-4">Alternative: Scripts direkt in die Proxmox Console kopieren</p>
            <code className="text-xs text-green-400 block bg-black/50 p-4 rounded">pct enter [CTID] -- bash</code>
          </div>
        </div>
      )}
    </div>
  )
}
