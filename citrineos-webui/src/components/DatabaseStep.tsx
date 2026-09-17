import { DatabaseConfig } from '../types'

interface Props {
  config: DatabaseConfig
  onChange: (config: DatabaseConfig) => void
  onNext: () => void
  onBack: () => void
}

export default function DatabaseStep({ config, onChange, onNext, onBack }: Props) {
  const update = (key: keyof DatabaseConfig, value: string | number | boolean) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">🗄️ Datenbank-Konfiguration</h2>
      
      <div className="flex gap-4 mb-6">
        {['postgresql', 'mysql'].map(type => (
          <button key={type} onClick={() => update('type', type as 'postgresql' | 'mysql')}
            className={`flex-1 p-4 rounded-lg border transition-all ${config.type === type ? 'border-purple-500 bg-purple-500/20' : 'border-gray-700 hover:border-gray-600'}`}>
            <span className="text-2xl block mb-2">{type === 'postgresql' ? '🐘' : '🐬'}</span>
            <span className="font-medium capitalize">{type}</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Host</label>
          <input className="input-field" value={config.host} onChange={e => update('host', e.target.value)} placeholder="localhost" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Port</label>
          <input className="input-field" type="number" value={config.port} onChange={e => update('port', parseInt(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Datenbank Name</label>
          <input className="input-field" value={config.database} onChange={e => update('database', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Benutzername</label>
          <input className="input-field" value={config.username} onChange={e => update('username', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Passwort</label>
          <input className="input-field" type="password" value={config.password} onChange={e => update('password', e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="toggle-switch">
          <input type="checkbox" checked={config.createNew} onChange={e => update('createNew', e.target.checked)} />
          <span className="slider"></span>
        </label>
        <span className="text-gray-300">Neue Datenbank erstellen</span>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-2 text-gray-400 hover:text-white">← Zurück</button>
        <button onClick={onNext} className="btn-gradient px-8 py-2">Weiter →</button>
      </div>
    </div>
  )
}
