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
  port: settingsFromFile.main_port || settingsFromFile.web_port || '3501',
  host: settingsFromFile.web_host || 'localhost',

  // Admin
  adminUsername: settingsFromFile.admin_username || 'admin',
  adminPassword: settingsFromFile.admin_password || 'admin',

  // GenieACS
  genieacsHost: settingsFromFile.genieacs_host || '192.168.99.103',
  genieacsPort: settingsFromFile.genieacs_port || '7557',
  genieacsUrl: settingsFromFile.genieacs_url || `http://${settingsFromFile.genieacs_host || '192.168.99.103'}:${settingsFromFile.genieacs_port || '7557'}`,
  genieacsUsername: settingsFromFile.genieacs_username || '',
  genieacsPassword: settingsFromFile.genieacs_password || '',
  genieApiUrl: settingsFromFile.genie_api_url || '',

  // Mikrotik
  mikrotikHost: settingsFromFile.mikrotik_host || '192.168.99.1',
  mikrotikPort: settingsFromFile.mikrotik_port || '8728',
  mikrotikUser: settingsFromFile.mikrotik_user || 'genieacs',
  mikrotikPassword: settingsFromFile.mikrotik_password || '12345678',

  // WhatsApp
  adminNumber: settingsFromFile.admin_number || '',
  technicianNumbers: settingsFromFile.technician_numbers || '',
  reconnectInterval: settingsFromFile.reconnect_interval || '5000',
  maxReconnectRetries: settingsFromFile.max_reconnect_retries || '5',
  whatsappSessionPath: settingsFromFile.whatsapp_session_path || './whatsapp-session',
  whatsappKeepAlive: settingsFromFile.whatsapp_keep_alive !== undefined ? settingsFromFile.whatsapp_keep_alive : false,
  whatsappRestartOnError: settingsFromFile.whatsapp_restart_on_error !== undefined ? settingsFromFile.whatsapp_restart_on_error : false,

  // Monitoring
  pppoeMonitorInterval: settingsFromFile.pppoe_monitor_interval || '60000',
  rxPowerWarning: settingsFromFile.rx_power_warning || '-25',
  rxPowerCritical: settingsFromFile.rx_power_critical || '-27',

  // Company Info
  companyHeader: settingsFromFile.company_header || 'ISP Monitor',
  footerInfo: settingsFromFile.footer_info || '',
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

// Fungsi untuk memulai server - HANYA menggunakan port dari settings.json
function startServer(portToUse) {
    logger.info(`🚀 Attempting to start server on configured port: ${portToUse}`);
    logger.info(`📋 Port diambil dari settings.json - tidak ada fallback ke port alternatif`);
    
    try {
        const server = app.listen(portToUse, () => {
            logger.info(`✅ Server berhasil berjalan pada port ${portToUse}`);
            logger.info(`🌐 Health check tersedia di: http://localhost:${portToUse}/health`);
            logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            // Keep port consistent with configured value
            global.appSettings.port = portToUse.toString();
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger.error(`❌ Port ${portToUse} is already in use!`);
                logger.error(`🚫 Server will NOT start on alternative port - using ONLY configured port`);
                logger.info(`💡 To fix this port conflict:`);
                logger.info(`   1. Stop the service using port ${portToUse}:`);
                logger.info(`      • Windows: netstat -ano | findstr :${portToUse}`);
                logger.info(`      • Then: taskkill /PID <PID> /F`);
                logger.info(`   2. Or change port in settings.json: "web_port": "3200"`);
                logger.info(`   3. Or set environment variable: WEB_PORT=3200`);
                logger.error(`🛑 Application will exit - please resolve port conflict`);
                process.exit(1);
            } else {
                logger.error(`❌ Failed to start server: ${err.message}`);
                process.exit(1);
            }
        });
        
        return server;
    } catch (error) {
        logger.error(`❌ Terjadi kesalahan saat memulai server: ${error.message}`);
        process.exit(1);
    }
}

// Pastikan port menggunakan nilai langsung dari .env
// Reload dotenv untuk memastikan kita mendapatkan nilai terbaru dari file .env
require('dotenv').config();
const port = parseInt(global.appSettings.port, 10);
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
