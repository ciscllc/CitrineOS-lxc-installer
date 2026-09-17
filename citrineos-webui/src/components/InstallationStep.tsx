import { useEffect, useState } from 'react'
import { InstallerState, INSTALLATION_LOG_MESSAGES } from '../types'

interface Props {
  state: InstallerState
  onComplete: () => void
}

export default function InstallationStep({ state, onComplete }: Props) {
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('')

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < INSTALLATION_LOG_MESSAGES.length) {
        const msg = INSTALLATION_LOG_MESSAGES[index]
        setLogs(prev => [...prev, msg])
        setCurrentMessage(msg)
        setProgress(((index + 1) / INSTALLATION_LOG_MESSAGES.length) * 100)
        index++
      } else {
        clearInterval(interval)
        setTimeout(onComplete, 1000)
      }
    }, 300)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">🚀 Installation läuft...</h2>
      
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{currentMessage}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar h-3">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="terminal-output">
        {logs.map((log, i) => (
          <div key={i} className={`${log.includes('[OK]') ? 'text-green-400' : log.includes('[ERROR]') || log.includes('[FEHLER]') ? 'text-red-400' : log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
            {log}
          </div>
        ))}
        <div className="animate-pulse">_</div>
      </div>

      {state.installationComplete && (
        <div className="card bg-green-900/30 border border-green-700">
          <h3 className="text-xl font-bold text-green-400 mb-4">✅ Installation erfolgreich abgeschlossen!</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">URL:</span>
              <a href={`http://${state.network.ipAddress || 'localhost'}:8085`} className="text-blue-400 hover:underline ml-2">
                http://{state.network.ipAddress || 'localhost'}:8085
              </a>
            </div>
            <div>
              <span className="text-gray-400">Benutzer:</span>
              <span className="text-white ml-2">{state.adminUser.username}</span>
            </div>
            <div>
              <span className="text-gray-400">Passwort:</span>
              <span className="text-yellow-400 ml-2 font-mono">{state.adminUser.password}</span>
            </div>
          </div>
          <p className="text-yellow-400 text-xs mt-4">⚠️ Bitte notieren Sie sich das Passwort - es wird nicht wieder angezeigt!</p>
        </div>
      )}
    </div>
  )
}
