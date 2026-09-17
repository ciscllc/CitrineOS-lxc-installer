import { useState } from 'react'
import WelcomeStep from './components/WelcomeStep'
import NetworkStep from './components/NetworkStep'
import DatabaseStep from './components/DatabaseStep'
import GoogleMapsStep from './components/GoogleMapsStep'
import OcppStep from './components/OcppStep'
import AdminUserStep from './components/AdminUserStep'
import SystemStep from './components/SystemStep'
import SummaryStep from './components/SummaryStep'
import InstallationStep from './components/InstallationStep'
import UpdaterStep from './components/UpdaterStep'
import DocumentationPage from './components/DocumentationPage'
import DeploymentPage from './components/DeploymentPage'
import { InstallerState, NetworkConfig, DatabaseConfig, GoogleMapsConfig, OcppConfig, AdminUser, SystemConfig } from './types'

const defaultNetwork: NetworkConfig = {
  hostname: 'citrineos-server',
  ipAddress: '',
  subnet: '255.255.255.0',
  gateway: '',
  dns1: '8.8.8.8',
  dns2: '8.8.4.4',
  networkInterface: 'eth0',
  dhcp: false,
}

const defaultDatabase: DatabaseConfig = {
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'citrineos',
  username: 'citrineos_user',
  password: '',
  createNew: true,
}

const defaultGoogleMaps: GoogleMapsConfig = {
  apiKey: '',
  enabled: false,
  defaultLat: 52.52,
  defaultLng: 13.405,
  defaultZoom: 12,
}

const defaultOcpp: OcppConfig = {
  supportedVersions: ['1.6', '2.0.1'],
  websocketPort: 8080,
  wsPort: 9000,
  maxConnections: 1000,
  heartbeatInterval: 30,
  bootRetryInterval: 60,
}

const defaultAdminUser: AdminUser = {
  username: 'admin',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  organization: '',
}

const defaultSystem: SystemConfig = {
  timezone: 'Europe/Berlin',
  locale: 'de_DE',
  sslEnabled: false,
  sslCertPath: '/etc/ssl/certs/citrineos.crt',
  sslKeyPath: '/etc/ssl/private/citrineos.key',
  autoUpdates: true,
  logLevel: 'info',
  redisHost: 'localhost',
  redisPort: 6379,
}

type Tab = 'installation' | 'updater' | 'dokumentation' | 'download'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('installation')
  const [state, setState] = useState<InstallerState>({
    currentStep: 1,
    network: defaultNetwork,
    database: defaultDatabase,
    googleMaps: defaultGoogleMaps,
    ocpp: defaultOcpp,
    adminUser: defaultAdminUser,
    system: defaultSystem,
    installationStarted: false,
    installationProgress: 0,
    installationLog: [],
    installationComplete: false,
  })

  const updateState = <K extends keyof InstallerState>(key: K, value: InstallerState[K]) => {
    setState(prev => ({ ...prev, [key]: value }))
  }

  const nextStep = () => {
    if (state.currentStep < 8) {
      updateState('currentStep', state.currentStep + 1)
    }
  }

  const prevStep = () => {
    if (state.currentStep > 1) {
      updateState('currentStep', state.currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <WelcomeStep onNext={nextStep} />
      case 2:
        return <NetworkStep config={state.network} onChange={(v) => updateState('network', v)} onNext={nextStep} onBack={prevStep} />
      case 3:
        return <DatabaseStep config={state.database} onChange={(v) => updateState('database', v)} onNext={nextStep} onBack={prevStep} />
      case 4:
        return <GoogleMapsStep config={state.googleMaps} onChange={(v) => updateState('googleMaps', v)} onNext={nextStep} onBack={prevStep} />
      case 5:
        return <OcppStep config={state.ocpp} onChange={(v) => updateState('ocpp', v)} onNext={nextStep} onBack={prevStep} />
      case 6:
        return <AdminUserStep config={state.adminUser} onChange={(v) => updateState('adminUser', v)} onNext={nextStep} onBack={prevStep} />
      case 7:
        return <SystemStep config={state.system} onChange={(v) => updateState('system', v)} onNext={nextStep} onBack={prevStep} />
      case 8:
        return <SummaryStep state={state} onStartInstall={() => updateState('installationStarted', true)} onBack={prevStep} />
      default:
        return null
    }
  }

  const steps = ['Willkommen', 'Netzwerk', 'Datenbank', 'Google Maps', 'OCPP', 'Admin', 'System', 'Zusammenfassung']

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <h1 className="text-xl font-bold text-white">CitrineOS Installer</h1>
                <p className="text-sm text-gray-400">Version 2.0.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-400">Bereit</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'installation', label: '📦 Installation', tab: 'installation' as Tab },
              { id: 'updater', label: '🔄 Updater', tab: 'updater' as Tab },
              { id: 'docs', label: '📚 Dokumentation', tab: 'dokumentation' as Tab },
              { id: 'deploy', label: '📥 Download', tab: 'download' as Tab },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.tab)}
                className={`tab-button whitespace-nowrap ${activeTab === item.tab ? 'active' : 'inactive'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'installation' && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Step Navigation */}
            <aside className="lg:col-span-1">
              <div className="card sticky top-24">
                <h3 className="text-lg font-semibold mb-4 text-white">Schritte</h3>
                <div className="space-y-2">
                  {steps.map((step, index) => {
                    const stepNum = index + 1
                    const isActive = stepNum === state.currentStep
                    const isCompleted = stepNum < state.currentStep
                    return (
                      <div
                        key={step}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          isActive ? 'bg-purple-600/20 border border-purple-600' : 
                          isCompleted ? 'text-green-400' : 'text-gray-400'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isActive ? 'bg-purple-600 text-white' :
                          isCompleted ? 'bg-green-600 text-white' : 'bg-gray-700'
                        }`}>
                          {isCompleted ? '✓' : stepNum}
                        </span>
                        <span className="text-sm">{step}</span>
                      </div>
                    )
                  })}
                </div>
                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Fortschritt</span>
                    <span>{Math.round(((state.currentStep - 1) / 7) * 100)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${((state.currentStep - 1) / 7) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {!state.installationStarted ? (
                <div className="card">
                  {renderStep()}
                </div>
              ) : (
                <InstallationStep
                  state={state}
                  onComplete={() => updateState('installationComplete', true)}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'updater' && <UpdaterStep />}
        {activeTab === 'dokumentation' && <DocumentationPage />}
        {activeTab === 'download' && <DeploymentPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2024 CitrineOS Installer. Open Source unter MIT License.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Debian 12 kompatibel</span>
              <span>•</span>
              <span>LXC/LXD unterstützt</span>
              <span>•</span>
              <span>Proxmox VE ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
