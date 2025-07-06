const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const { logger } = require('./config/logger');
const whatsapp = require('./config/whatsapp');
const { monitorPPPoEConnections } = require('./config/mikrotik');
const fs = require('fs');

// Inisialisasi aplikasi Express minimal (hanya untuk health check)
const app = express();

// Middleware dasar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konstanta
const VERSION = '1.0.0';

// Variabel global untuk menyimpan status koneksi WhatsApp
global.whatsappStatus = {
    connected: false,
    qrCode: null,
    phoneNumber: null,
    connectedSince: null,
    status: 'disconnected'
};

// Fungsi untuk memuat settings dari settings.json
function loadSettings() {
    try {
        const fs = require('fs');
        const path = require('path');
        const settingsPath = path.join(__dirname, 'settings.json');

        if (fs.existsSync(settingsPath)) {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);

            console.log('Settings loaded from settings.json');
            return settings;
        } else {
            console.log('settings.json not found, using environment variables');
            return {};
        }
    } catch (error) {
        console.error('Error loading settings.json:', error.message);
        return {};
    }
}

// Load settings dari settings.json
const settingsFromFile = loadSettings();

// Variabel global untuk menyimpan semua pengaturan (prioritas: settings.json > .env > default)
global.appSettings = {
  // Server
  port: settingsFromFile.web_port || process.env.PORT || '3501',
  host: settingsFromFile.web_host || process.env.HOST || 'localhost',

  // Admin
  adminUsername: settingsFromFile.admin_username || process.env.ADMIN_USERNAME || 'admin',
  adminPassword: settingsFromFile.admin_password || process.env.ADMIN_PASSWORD || 'admin',

  // GenieACS
  genieacsHost: settingsFromFile.genieacs_host || process.env.GENIEACS_HOST || '192.168.8.89',
  genieacsPort: settingsFromFile.genieacs_port || process.env.GENIEACS_PORT || '7557',
  genieacsUrl: settingsFromFile.genieacs_url || process.env.GENIEACS_URL || `http://${settingsFromFile.genieacs_host || '192.168.8.89'}:${settingsFromFile.genieacs_port || '7557'}`,
  genieacsUsername: settingsFromFile.genieacs_username || process.env.GENIEACS_USERNAME || '',
  genieacsPassword: settingsFromFile.genieacs_password || process.env.GENIEACS_PASSWORD || '',
  genieApiUrl: settingsFromFile.genie_api_url || process.env.GENIE_API_URL || '',

  // Mikrotik
  mikrotikHost: settingsFromFile.mikrotik_host || process.env.MIKROTIK_HOST || '192.168.8.1',
  mikrotikPort: settingsFromFile.mikrotik_port || process.env.MIKROTIK_PORT || '8700',
  mikrotikUser: settingsFromFile.mikrotik_user || process.env.MIKROTIK_USER || 'admin',
  mikrotikPassword: settingsFromFile.mikrotik_password || process.env.MIKROTIK_PASSWORD || '',

  // WhatsApp
  adminNumber: settingsFromFile.admin_number || process.env.ADMIN_NUMBER || '',
  technicianNumbers: settingsFromFile.technician_numbers || process.env.TECHNICIAN_NUMBERS || '',
  reconnectInterval: settingsFromFile.reconnect_interval || process.env.RECONNECT_INTERVAL || '5000',
  maxReconnectRetries: settingsFromFile.max_reconnect_retries || process.env.MAX_RECONNECT_RETRIES || '5',
  whatsappSessionPath: settingsFromFile.whatsapp_session_path || process.env.WHATSAPP_SESSION_PATH || './whatsapp-session',
  whatsappKeepAlive: settingsFromFile.whatsapp_keep_alive !== undefined ? settingsFromFile.whatsapp_keep_alive : (process.env.WHATSAPP_KEEP_ALIVE === 'true'),
  whatsappRestartOnError: settingsFromFile.whatsapp_restart_on_error !== undefined ? settingsFromFile.whatsapp_restart_on_error : (process.env.WHATSAPP_RESTART_ON_ERROR === 'true'),

  // Monitoring
  pppoeMonitorInterval: settingsFromFile.pppoe_monitor_interval || process.env.PPPOE_MONITOR_INTERVAL || '60000',
  rxPowerWarning: settingsFromFile.rx_power_warning || process.env.RX_POWER_WARNING || '-25',
  rxPowerCritical: settingsFromFile.rx_power_critical || process.env.RX_POWER_CRITICAL || '-27',

  // Company Info
  companyHeader: settingsFromFile.company_header || process.env.COMPANY_HEADER || 'ISP Monitor',
  footerInfo: settingsFromFile.footer_info || process.env.FOOTER_INFO || '',
};

console.log('Global settings initialized:');
console.log('- Mikrotik:', global.appSettings.mikrotikHost + ':' + global.appSettings.mikrotikPort);
console.log('- GenieACS:', global.appSettings.genieacsUrl);
console.log('- Web Port:', global.appSettings.port);

// Pastikan direktori sesi WhatsApp ada
const sessionDir = process.env.WHATSAPP_SESSION_PATH || './whatsapp-session';
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
    logger.info(`Direktori sesi WhatsApp dibuat: ${sessionDir}`);
}

// Route untuk health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: VERSION,
        whatsapp: global.whatsappStatus.status
    });
});

// Route untuk mendapatkan status WhatsApp
app.get('/whatsapp/status', (req, res) => {
    res.json({
        status: global.whatsappStatus.status,
        connected: global.whatsappStatus.connected,
        phoneNumber: global.whatsappStatus.phoneNumber,
        connectedSince: global.whatsappStatus.connectedSince
    });
});

// Import PPPoE monitoring modules
const pppoeMonitor = require('./config/pppoe-monitor');
const pppoeCommands = require('./config/pppoe-commands');

// Import GenieACS commands module
const genieacsCommands = require('./config/genieacs-commands');

// Import MikroTik commands module
const mikrotikCommands = require('./config/mikrotik-commands');

// Import Web Interface
const { startWebServer } = require('./web/app');

// Inisialisasi WhatsApp dan PPPoE monitoring
try {
    whatsapp.connectToWhatsApp().then(sock => {
        if (sock) {
            // Set sock instance untuk whatsapp
            whatsapp.setSock(sock);

            // Set sock instance untuk PPPoE monitoring
            pppoeMonitor.setSock(sock);
            pppoeCommands.setSock(sock);

            // Set sock instance untuk GenieACS commands
            genieacsCommands.setSock(sock);

            // Set sock instance untuk MikroTik commands
            mikrotikCommands.setSock(sock);

            logger.info('WhatsApp connected successfully');

            // Initialize PPPoE monitoring jika MikroTik dikonfigurasi
            if (process.env.MIKROTIK_HOST && process.env.MIKROTIK_USER && process.env.MIKROTIK_PASSWORD) {
                pppoeMonitor.initializePPPoEMonitoring().then(() => {
                    logger.info('PPPoE monitoring initialized');
                }).catch(err => {
                    logger.error('Error initializing PPPoE monitoring:', err);
                });
            }
        }
    }).catch(err => {
        logger.error('Error connecting to WhatsApp:', err);
    });

    // Mulai monitoring PPPoE lama jika dikonfigurasi (fallback)
    if (process.env.MIKROTIK_HOST && process.env.MIKROTIK_USER && process.env.MIKROTIK_PASSWORD) {
        monitorPPPoEConnections().catch(err => {
            logger.error('Error starting legacy PPPoE monitoring:', err);
        });
    }
} catch (error) {
    logger.error('Error initializing services:', error);
}

// Fungsi untuk memulai server dengan penanganan port yang sudah digunakan
function startServer(portToUse) {
    logger.info(`Mencoba memulai server pada port ${portToUse}...`);
    
    // Coba port alternatif jika port utama tidak tersedia
    try {
        const server = app.listen(portToUse, () => {
            logger.info(`Server berhasil berjalan pada port ${portToUse}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            // Update global.appSettings.port dengan port yang berhasil digunakan
            global.appSettings.port = portToUse.toString();
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger.warn(`PERINGATAN: Port ${portToUse} sudah digunakan, mencoba port alternatif...`);
                // Coba port alternatif (port + 1000)
                const alternativePort = portToUse + 1000;
                logger.info(`Mencoba port alternatif: ${alternativePort}`);
                
                // Buat server baru dengan port alternatif
                const alternativeServer = app.listen(alternativePort, () => {
                    logger.info(`Server berhasil berjalan pada port alternatif ${alternativePort}`);
                    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
                    // Update global.appSettings.port dengan port yang berhasil digunakan
                    global.appSettings.port = alternativePort.toString();
                }).on('error', (altErr) => {
                    logger.error(`ERROR: Gagal memulai server pada port alternatif ${alternativePort}:`, altErr.message);
                    process.exit(1);
                });
            } else {
                logger.error('Error starting server:', err);
                process.exit(1);
            }
        });
    } catch (error) {
        logger.error(`Terjadi kesalahan saat memulai server:`, error);
        process.exit(1);
    }
}

// Pastikan port menggunakan nilai langsung dari .env
// Reload dotenv untuk memastikan kita mendapatkan nilai terbaru dari file .env
require('dotenv').config();
port = parseInt(process.env.PORT, 10);
logger.info(`Attempting to start server on configured port: ${port}`);

// Mulai server dengan port dari konfigurasi
startServer(port);

// Start Web Interface on different port
try {
    startWebServer();
    logger.info('Web interface started successfully');
} catch (error) {
    logger.error('Error starting web interface:', error);
}

// Tambahkan perintah untuk menambahkan nomor pelanggan ke tag GenieACS
const { addCustomerTag } = require('./config/customerTag');

// Export app untuk testing
module.exports = app;
