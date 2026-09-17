import { GoogleMapsConfig } from '../types'

interface Props {
  config: GoogleMapsConfig
  onChange: (config: GoogleMapsConfig) => void
  onNext: () => void
  onBack: () => void
}

export default function GoogleMapsStep({ config, onChange, onNext, onBack }: Props) {
  const update = (key: keyof GoogleMapsConfig, value: string | number | boolean) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">🗺️ Google Maps Integration</h2>
      
      <div className="card bg-blue-900/20 border-blue-800">
        <p className="text-blue-300 text-sm">Optional: Aktivieren Sie Google Maps für die visuelle Darstellung von Ladestationen.</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <label className="toggle-switch">
          <input type="checkbox" checked={config.enabled} onChange={e => update('enabled', e.target.checked)} />
          <span className="slider"></span>
        </label>
        <span className="text-gray-300">Google Maps aktivieren</span>
      </div>

      {config.enabled && (
        <>
          <div>
            <label className="block text-sm text-gray-400 mb-1">API Key</label>
            <input className="input-field" value={config.apiKey} onChange={e => update('apiKey', e.target.value)} placeholder="AIzaSy..." />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Breitengrad</label>
              <input className="input-field" type="number" step="0.0001" value={config.defaultLat} onChange={e => update('defaultLat', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Längengrad</label>
              <input className="input-field" type="number" step="0.0001" value={config.defaultLng} onChange={e => update('defaultLng', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Zoom-Level</label>
              <input className="input-field" type="number" value={config.defaultZoom} onChange={e => update('defaultZoom', parseInt(e.target.value))} min="1" max="20" />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-2 text-gray-400 hover:text-white">← Zurück</button>
        <button onClick={onNext} className="btn-gradient px-8 py-2">Weiter →</button>
      </div>
    </div>
  )
}
