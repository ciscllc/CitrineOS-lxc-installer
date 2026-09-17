import { useState } from 'react'

const CHANGELOG = [
  { version: '2.0.0', date: '2024-01-15', changes: ['Neue Web-UI', 'Verbesserte Fehlerbehandlung', 'SSL Support'] },
  { version: '1.5.0', date: '2024-01-01', changes: ['OCPP 2.0.1 Support', 'Redis Caching', 'Bugfixes'] },
  { version: '1.4.0', date: '2023-12-15', changes: ['PostgreSQL Optimierung', 'Backup Script', 'Dokumentation'] },
]

export default function UpdaterStep() {
  const [checking, setChecking] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [currentVersion] = useState('2.0.0')

  const checkForUpdates = () => {
    setChecking(true)
    setTimeout(() => {
      setChecking(false)
      setUpdateAvailable(Math.random() > 0.5)
    }, 1500)
  }

  const startDownload = () => {
    setDownloading(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setDownloadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setDownloading(false)
        alert('Update bereit zur Installation!')
      }
    }, 200)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">🔄 Update-Verwaltung</h2>

      {/* Current Version Card */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Aktuelle Version</p>
          <p className="text-3xl font-bold text-purple-400">v{currentVersion}</p>
        </div>
        <button onClick={checkForUpdates} disabled={checking} className="btn-gradient px-6 py-2">
          {checking ? 'Prüfe...' : 'Nach Updates suchen'}
        </button>
      </div>

      {updateAvailable && (
        <div className="card bg-green-900/30 border border-green-700">
          <h3 className="text-lg font-semibold text-green-400 mb-2">✨ Update verfügbar!</h3>
          <p className="text-gray-300 mb-4">Version 2.1.0 ist bereit zur Installation.</p>
          <div className="flex gap-4">
            <button onClick={startDownload} disabled={downloading} className="btn-gradient px-6 py-2">
              {downloading ? `Lädt... ${downloadProgress}%` : 'Jetzt herunterladen'}
            </button>
            {downloading && (
              <div className="flex-1 progress-bar">
                <div className="progress-bar-fill" style={{ width: `${downloadProgress}%` }}></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Changelog */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">📝 Changelog</h3>
        <div className="space-y-4">
          {CHANGELOG.map(log => (
            <div key={log.version} className="border-b border-gray-700 pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-purple-400">v{log.version}</span>
                <span className="text-xs text-gray-500">{log.date}</span>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {log.changes.map((change, i) => <li key={i}>{change}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Section */}
      <div className="card bg-yellow-900/20 border border-yellow-700">
        <h3 className="font-semibold text-yellow-400 mb-2">💾 Backup vor Update</h3>
        <p className="text-sm text-gray-300 mb-4">Es wird empfohlen, vor jedem Update ein Backup zu erstellen.</p>
        <button className="px-4 py-2 bg-yellow-600/20 border border-yellow-600 rounded-lg text-yellow-400 hover:bg-yellow-600/30">
          Backup erstellen
        </button>
      </div>
    </div>
  )
}
