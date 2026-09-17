import { SystemConfig } from '../types'

interface Props {
  config: SystemConfig
  onChange: (config: SystemConfig) => void
  onNext: () => void
  onBack: () => void
}

export default function SystemStep({ config, onChange, onNext, onBack }: Props) {
  const update = (key: keyof SystemConfig, value: string | number | boolean) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">⚙️ System-Einstellungen</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Zeitzone</label>
          <select className="input-field" value={config.timezone} onChange={e => update('timezone', e.target.value)}>
            <option value="Europe/Berlin">Europe/Berlin</option>
            <option value="Europe/Vienna">Europe/Vienna</option>
            <option value="Europe/Zurich">Europe/Zurich</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Sprache</label>
          <select className="input-field" value={config.locale} onChange={e => update('locale', e.target.value)}>
            <option value="de_DE">Deutsch</option>
            <option value="en_US">English</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
          <div>
            <span className="text-white font-medium block">SSL/TLS aktivieren</span>
            <span className="text-xs text-gray-400">HTTPS für sichere Verbindungen</span>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={config.sslEnabled} onChange={e => update('sslEnabled', e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
          <div>
            <span className="text-white font-medium block">Auto-Updates</span>
            <span className="text-xs text-gray-400">Automatische Sicherheitsupdates</span>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={config.autoUpdates} onChange={e => update('autoUpdates', e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Log-Level</label>
        <select className="input-field" value={config.logLevel} onChange={e => update('logLevel', e.target.value as any)}>
          <option value="debug">Debug (alle Details)</option>
          <option value="info">Info (Standard)</option>
          <option value="warn">Warnung (nur Warnungen)</option>
          <option value="error">Fehler (nur Fehler)</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Redis Host</label>
          <input className="input-field" value={config.redisHost} onChange={e => update('redisHost', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Redis Port</label>
          <input className="input-field" type="number" value={config.redisPort} onChange={e => update('redisPort', parseInt(e.target.value))} />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-2 text-gray-400 hover:text-white">← Zurück</button>
        <button onClick={onNext} className="btn-gradient px-8 py-2">Weiter →</button>
      </div>
    </div>
  )
}
