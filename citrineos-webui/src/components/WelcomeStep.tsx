import { NetworkConfig } from '../types'

interface Props {
  onNext: () => void
}

export default function WelcomeStep({ onNext }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <span className="text-6xl mb-4 block">⚡</span>
        <h2 className="text-3xl font-bold text-white mb-2">Willkommen bei CitrineOS</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Der professionelle Installer für Ihr OCPP Charge Point Management System auf Debian 12
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {[
          { icon: '🚀', title: 'Schnelle Installation', desc: 'In 5 Minuten einsatzbereit' },
          { icon: '🔒', title: 'Sicher', desc: 'Firewall & SSL integriert' },
          { icon: '📦', title: 'Komplettpaket', desc: 'Alle Services vorkonfiguriert' },
        ].map(item => (
          <div key={item.title} className="card text-center p-4">
            <span className="text-3xl mb-2 block">{item.icon}</span>
            <h3 className="font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="card mt-8">
        <h3 className="font-semibold text-white mb-4">📋 Systemvoraussetzungen</h3>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Debian 12 (Bookworm)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Mindestens 2GB RAM
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span> 10GB freier Speicherplatz
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Root-Zugriff erforderlich
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Internetverbindung
          </li>
        </ul>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={onNext} className="btn-gradient px-8 py-3">
          Los geht's →
        </button>
      </div>
    </div>
  )
}
