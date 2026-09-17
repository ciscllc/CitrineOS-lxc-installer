export interface NetworkConfig {
  hostname: string;
  ipAddress: string;
  subnet: string;
  gateway: string;
  dns1: string;
  dns2: string;
  networkInterface: string;
  dhcp: boolean;
}

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  createNew: boolean;
}

export interface GoogleMapsConfig {
  apiKey: string;
  enabled: boolean;
  defaultLat: number;
  defaultLng: number;
  defaultZoom: number;
}

export interface OcppConfig {
  supportedVersions: string[];
  websocketPort: number;
  wsPort: number;
  maxConnections: number;
  heartbeatInterval: number;
  bootRetryInterval: number;
}

export interface AdminUser {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  organization: string;
}

export interface SystemConfig {
  timezone: string;
  locale: string;
  sslEnabled: boolean;
  sslCertPath: string;
  sslKeyPath: string;
  autoUpdates: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  redisHost: string;
  redisPort: number;
}

export interface InstallerState {
  currentStep: number;
  network: NetworkConfig;
  database: DatabaseConfig;
  googleMaps: GoogleMapsConfig;
  ocpp: OcppConfig;
  adminUser: AdminUser;
  system: SystemConfig;
  installationStarted: boolean;
  installationProgress: number;
  installationLog: string[];
  installationComplete: boolean;
}

export const INSTALLATION_LOG_MESSAGES: string[] = [
  '[INFO] Starting CitrineOS installation...',
  '[INFO] Checking system requirements...',
  '[OK] System requirements met',
  '[INFO] Step 1/10: Updating system packages...',
  '[INFO] apt-get update running...',
  '[OK] System packages updated',
  '[INFO] Step 2/10: Installing dependencies...',
  '[INFO] Installing Node.js 24...',
  '[INFO] Installing PostgreSQL 15...',
  '[INFO] Installing Redis 7...',
  '[OK] Dependencies installed',
  '[INFO] Step 3/10: Configuring PostgreSQL...',
  '[INFO] Creating database citrineos...',
  '[INFO] Creating user citrineos_user...',
  '[OK] PostgreSQL configured',
  '[INFO] Step 4/10: Configuring Redis...',
  '[OK] Redis configured',
  '[INFO] Step 5/10: Cloning CitrineOS repository...',
  '[INFO] Downloading from GitHub...',
  '[OK] Repository cloned',
  '[INFO] Step 6/10: Installing npm dependencies...',
  '[INFO] Running npm install...',
  '[OK] Dependencies installed',
  '[INFO] Step 7/10: Building application...',
  '[INFO] Running npm run build...',
  '[OK] Build completed',
  '[INFO] Step 8/10: Creating systemd services...',
  '[OK] Services created',
  '[INFO] Step 9/10: Configuring firewall...',
  '[OK] Firewall configured',
  '[INFO] Step 10/10: Starting services...',
  '[OK] All services started',
  '[SUCCESS] CitrineOS installation completed successfully!',
];
