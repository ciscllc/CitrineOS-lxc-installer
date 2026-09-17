import { OcppConfig } from '../types'

interface Props {
  config: OcppConfig
  onChange: (config: OcppConfig) => void
  onNext: () => void
  onBack: () => void
}

export default function OcppStep({ config, onChange, onNext, onBack }: Props) {
  const update = (key: keyof OcppConfig, value: string[] | number) => {
    onChange({ ...config, [key]: value })
  }

  const toggleVersion = (version: string) => {
    const versions = config.supportedVersions.includes(version)
      ? config.supportedVersions.filter(v => v !== version)
      : [...config.supportedVersions, version]
    update('supportedVersions', versions)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">🔌 OCPP Konfiguration</h2>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">Unterstützte OCPP Versionen</label>
        <div className="flex gap-3">
          {['1.6', '2.0.1'].map(version => (
            <button key={version} onClick={() => toggleVersion(version)}
              className={`px-4 py-2 rounded-lg border transition-all ${config.supportedVersions.includes(version) ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-gray-700 text-gray-400'}`}>
              OCPP {version}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">WebSocket Port (ws://)</label>
          <input className="input-field" type="number" value={config.websocketPort} onChange={e => update('websocketPort', parseInt(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Secure WebSocket Port (wss://)</label>
          <input className="input-field" type="number" value={config.wsPort} onChange={e => update('wsPort', parseInt(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Max. Verbindungen</label>
          <input className="input-field" type="number" value={config.maxConnections} onChange={e => update('maxConnections', parseInt(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Heartbeat Intervall (Sekunden)</label>
          <input className="input-field" type="number" value={config.heartbeatInterval} onChange={e => update('heartbeatInterval', parseInt(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Boot Retry Intervall (Sekunden)</label>
          <input className="input-field" type="number" value={config.bootRetryInterval} onChange={e => update('bootRetryInterval', parseInt(e.target.value))} />
        </div>
      </div>

      <div className="card bg-gray-900 p-4">
        <h4 className="font-medium text-white mb-2">WebSocket URLs</h4>
        <code className="text-green-400 text-sm block">ws://SERVER_IP:{config.websocketPort}/ocpp/&#123;chargePointId&#125;</code>
        <code className="text-green-400 text-sm block mt-1">wss://SERVER_IP:{config.wsPort}/ocpp/&#123;chargePointId&#125;</code>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-2 text-gray-400 hover:text-white">← Zurück</button>
        <button onClick={onNext} className="btn-gradient px-8 py-2">Weiter →</button>
      </div>
    </div>
  )
}
