import { NetworkConfig } from '../types'

interface Props {
  config: NetworkConfig
  onChange: (config: NetworkConfig) => void
  onNext: () => void
  onBack: () => void
}

export default function NetworkStep({ config, onChange, onNext, onBack }: Props) {
  const update = (key: keyof NetworkConfig, value: string | number | boolean) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">🌐 Netzwerkkonfiguration</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Hostname</label>
          <input className="input-field" value={config.hostname} onChange={e => update('hostname', e.target.value)} placeholder="citrineos-server" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">IP-Adresse</label>
          <input className="input-field" value={config.ipAddress} onChange={e => update('ipAddress', e.target.value)} placeholder="192.168.1.100" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Subnetzmaske</label>
          <input className="input-field" value={config.subnet} onChange={e => update('subnet', e.target.value)} placeholder="255.255.255.0" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Gateway</label>
          <input className="input-field" value={config.gateway} onChange={e => update('gateway', e.target.value)} placeholder="192.168.1.1" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">DNS Server 1</label>
          <input className="input-field" value={config.dns1} onChange={e => update('dns1', e.target.value)} placeholder="8.8.8.8" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">DNS Server 2</label>
          <input className="input-field" value={config.dns2} onChange={e => update('dns2', e.target.value)} placeholder="8.8.4.4" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="toggle-switch">
          <input type="checkbox" checked={config.dhcp} onChange={e => update('dhcp', e.target.checked)} />
          <span className="slider"></span>
        </label>
        <span className="text-gray-300">DHCP verwenden</span>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-2 text-gray-400 hover:text-white">← Zurück</button>
        <button onClick={onNext} className="btn-gradient px-8 py-2">Weiter →</button>
      </div>
    </div>
  )
}
