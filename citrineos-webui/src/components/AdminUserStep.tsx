import { AdminUser } from '../types'

interface Props {
  config: AdminUser
  onChange: (config: AdminUser) => void
  onNext: () => void
  onBack: () => void
}

export default function AdminUserStep({ config, onChange, onNext, onBack }: Props) {
  const update = (key: keyof AdminUser, value: string) => {
    onChange({ ...config, [key]: value })
  }

  const getPasswordStrength = () => {
    const pw = config.password
    if (!pw) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (pw.length >= 8) strength++
    if (pw.length >= 12) strength++
    if (/[A-Z]/.test(pw)) strength++
    if (/[a-z]/.test(pw)) strength++
    if (/[0-9]/.test(pw)) strength++
    if (/[^A-Za-z0-9]/.test(pw)) strength++
    
    const labels = ['', 'Sehr schwach', 'Schwach', 'Mittel', 'Gut', 'Stark', 'Sehr stark']
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500']
    return { strength, label: labels[strength] || '', color: colors[strength] || '' }
  }

  const pwStrength = getPasswordStrength()
  const passwordsMatch = config.password === config.confirmPassword && config.password.length > 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">👤 Admin-Benutzer erstellen</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Benutzername</label>
          <input className="input-field" value={config.username} onChange={e => update('username', e.target.value)} placeholder="admin" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">E-Mail *</label>
          <input className="input-field" type="email" value={config.email} onChange={e => update('email', e.target.value)} placeholder="admin@example.com" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Vorname</label>
          <input className="input-field" value={config.firstName} onChange={e => update('firstName', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nachname</label>
          <input className="input-field" value={config.lastName} onChange={e => update('lastName', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Organisation</label>
          <input className="input-field" value={config.organization} onChange={e => update('organization', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Passwort *</label>
          <input className="input-field" type="password" value={config.password} onChange={e => update('password', e.target.value)} />
          {config.password && (
            <div className="mt-2">
              <div className="progress-bar h-1">
                <div className={`h-full ${pwStrength.color}`} style={{ width: `${(pwStrength.strength / 6) * 100}%` }}></div>
              </div>
              <span className="text-xs text-gray-400">{pwStrength.label}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Passwort bestätigen *</label>
          <input className={`input-field ${config.confirmPassword && !passwordsMatch ? 'border-red-500' : ''}`} type="password" value={config.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
          {config.confirmPassword && !passwordsMatch && <span className="text-xs text-red-400">Passwörter stimmen nicht überein</span>}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-2 text-gray-400 hover:text-white">← Zurück</button>
        <button onClick={onNext} disabled={!config.email || !config.password || !passwordsMatch} 
          className={`btn-gradient px-8 py-2 ${(!config.email || !config.password || !passwordsMatch) ? 'opacity-50 cursor-not-allowed' : ''}`}>
          Weiter →
        </button>
      </div>
    </div>
  )
}
