# 🌐 Alijaya Web Interface

Web interface modern dan responsive untuk sistem monitoring jaringan Alijaya yang terintegrasi dengan WhatsApp Bot, GenieACS, dan MikroTik.

## ✨ Fitur Utama

### 👨‍💼 Admin Dashboard
- **Dashboard Overview** - Statistik real-time perangkat dan jaringan
- **Device Management** - Kelola semua perangkat ONT/CPE
- **Network Monitoring** - Monitor status jaringan dan koneksi
- **PPPoE Management** - Kelola koneksi PPPoE dan monitoring
- **System Information** - Status sistem dan koneksi

### 👤 Customer Portal
- **Device Information** - Informasi detail perangkat pelanggan
- **WiFi Settings** - Ubah SSID dan password WiFi
- **Device Status** - Status real-time perangkat
- **Device Control** - Restart perangkat

## 🚀 Instalasi dan Setup

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Konfigurasi Port dan Environment

#### **Konfigurasi Port (3 cara):**

**Cara 1: Environment Variable (.env file)**
```bash
# Set custom port
WEB_PORT=3200
WEB_SESSION_SECRET=your-secret-key
CUSTOMER_DEFAULT_PASSWORD=customer123
```

**Cara 2: settings.json**
```json
{
  "web_port": 3200,
  "web_session_secret": "your-secret-key",
  "customer_default_password": "customer123",
  "admin_username": "admin",
  "admin_password": "admin",
  "genieacs_url": "192.168.8.89:7557",
  "genieacs_username": "acs",
  "genieacs_password": "060111"
}
```

**Cara 3: Default dengan Auto-fallback**
- Default port: **3100** (bukan 3000)
- Jika port sedang digunakan, otomatis coba port + 100
- Sistem akan memberikan pesan error yang jelas dengan solusi

#### **Priority Konfigurasi:**
1. **Environment Variable** (highest priority)
2. **settings.json**
3. **Default values** (port 3100)

### 3. Menjalankan Web Interface

#### **Start Complete System (Recommended)**
```bash
# Start sistem utama (WhatsApp bot + Web interface)
node app-whatsapp-only.js
```

#### **Start Web Interface Only**
```bash
cd web
npm start
```

#### **Custom Port Examples**
```bash
# Using environment variable
WEB_PORT=3200 node app-whatsapp-only.js

# Using .env file
echo "WEB_PORT=3200" >> .env
node app-whatsapp-only.js
```

## 🔐 Authentication

### Admin Login
- **URL**: `http://localhost:3100/auth/login?type=admin` (atau port yang dikonfigurasi)
- **Username**: Sesuai `admin_username` di settings.json
- **Password**: Sesuai `admin_password` di settings.json

### Customer Login
- **URL**: `http://localhost:3100/auth/login?type=customer` (atau port yang dikonfigurasi)
- **Username**: Nomor telepon pelanggan (tag di GenieACS)
- **Password**: Sesuai `customer_default_password` di settings.json (default: customer123)

## 📱 Responsive Design

Web interface dirancang dengan pendekatan mobile-first:
- ✅ **Desktop** - Full featured dashboard
- ✅ **Tablet** - Optimized layout
- ✅ **Mobile** - Touch-friendly interface

## 🎨 UI/UX Features

### Modern Design
- **Bootstrap 5** - Framework CSS modern
- **Bootstrap Icons** - Icon set lengkap
- **Gradient Backgrounds** - Visual yang menarik
- **Card-based Layout** - Organisasi konten yang baik

### Interactive Elements
- **Real-time Updates** - Auto-refresh data
- **Toast Notifications** - Feedback user yang jelas
- **Loading States** - Indikator proses
- **Hover Effects** - Interaksi yang smooth

### Accessibility
- **Keyboard Navigation** - Support navigasi keyboard
- **Screen Reader Friendly** - ARIA labels
- **High Contrast** - Mudah dibaca
- **Responsive Text** - Ukuran teks yang sesuai

## 🔧 API Endpoints

### Authentication
```
POST /auth/login          # Login admin/customer
POST /auth/logout         # Logout
GET  /auth/login          # Login page
```

### Admin API
```
GET  /admin/dashboard     # Admin dashboard
GET  /admin/devices       # Device list
GET  /admin/devices/:id   # Device detail
GET  /admin/network       # Network monitoring
GET  /admin/pppoe         # PPPoE management
GET  /admin/api/stats     # System statistics
POST /admin/api/devices/:id/restart      # Restart device
POST /admin/api/devices/:id/factory-reset # Factory reset
```

### Customer API
```
GET  /customer/dashboard  # Customer dashboard
GET  /customer/wifi       # WiFi settings
GET  /customer/status     # Device status
POST /customer/api/wifi/ssid     # Change SSID
POST /customer/api/wifi/password # Change password
POST /customer/api/device/restart # Restart device
GET  /customer/api/device/info   # Device info
```

## 🔌 Integrasi dengan Sistem Existing

### WhatsApp Bot Integration
- Menggunakan modul yang sama dengan WhatsApp bot
- Tidak mengganggu fungsi WhatsApp yang sudah ada
- Shared authentication dan konfigurasi

### GenieACS Integration
- API calls ke GenieACS server
- Parameter extraction dengan fallback paths
- Device management dan monitoring

### MikroTik Integration
- PPPoE monitoring dan management
- Network statistics
- User management

## 📊 Dashboard Features

### Admin Dashboard
```
📈 Statistics Cards
├── Total Devices
├── Online Devices  
├── Offline Devices
└── Uptime Percentage

🚀 Quick Actions
├── Manage Devices
├── Network Monitor
├── PPPoE Status
└── System Info

📋 System Status
├── WhatsApp Bot Status
├── GenieACS Connection
├── MikroTik Connection
└── PPPoE Monitoring
```

### Customer Dashboard
```
📱 Device Information
├── Phone Number
├── Serial Number
├── Model & Manufacturer
└── Connection Status

⚡ Quick Actions
├── WiFi Settings
├── Device Status
└── Restart Device

📊 Status Summary
├── Connection Status
├── Security Status
├── Performance Status
└── Configuration Status
```

## 🛡️ Security Features

### Authentication
- **Session-based** - Secure session management
- **Role-based Access** - Admin vs Customer access
- **Auto-logout** - Session timeout
- **CSRF Protection** - Cross-site request forgery protection

### Data Protection
- **Input Validation** - Server-side validation
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Output encoding
- **Rate Limiting** - API rate limiting

## 🔧 Customization

### Styling
```css
/* Custom CSS variables */
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --danger-color: #ef4444;
}
```

### Configuration
```javascript
// Web-specific configuration
const webConfig = {
    port: process.env.WEB_PORT || 3000,
    sessionSecret: process.env.SESSION_SECRET,
    customerDefaultPassword: process.env.CUSTOMER_DEFAULT_PASSWORD
};
```

## 📝 Development

### File Structure
```
web/
├── app.js                 # Main Express app
├── package.json          # Dependencies
├── routes/               # Route handlers
│   ├── auth.js          # Authentication
│   ├── admin.js         # Admin routes
│   └── customer.js      # Customer routes
├── middleware/          # Custom middleware
│   └── auth.js         # Auth middleware
├── views/              # EJS templates
│   ├── layouts/        # Layout templates
│   ├── admin/          # Admin views
│   ├── customer/       # Customer views
│   └── partials/       # Reusable components
├── public/             # Static assets
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript
│   └── assets/        # Images, fonts
└── config/            # Configuration
    └── genieacs.js    # GenieACS integration
```

### Adding New Features
1. **Create Route** - Add route handler
2. **Create View** - Add EJS template
3. **Add API** - Create API endpoint
4. **Update Navigation** - Update sidebar
5. **Test** - Test functionality

## 🚀 Production Deployment

### Environment Variables
```bash
# Web Interface
WEB_PORT=3000
SESSION_SECRET=your-secret-key
CUSTOMER_DEFAULT_PASSWORD=customer123

# Existing configuration
GENIEACS_URL=your-genieacs-url
GENIEACS_USERNAME=your-username
GENIEACS_PASSWORD=your-password
```

### Process Management
```bash
# Using PM2
pm2 start app-whatsapp-only.js --name "alijaya-system"

# Using systemd
sudo systemctl start alijaya-system
sudo systemctl enable alijaya-system
```

### Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📞 Support

Untuk bantuan dan support:
- 📧 Email: support@alijaya.net
- 💬 WhatsApp: +62 819 4721 5703
- 🌐 Website: https://alijaya.net

## 🎉 Kesimpulan

Web interface Alijaya memberikan:
- ✅ **User Experience** yang modern dan intuitif
- ✅ **Mobile Responsive** untuk akses dari mana saja
- ✅ **Real-time Monitoring** untuk admin dan pelanggan
- ✅ **Secure Authentication** dengan role-based access
- ✅ **Seamless Integration** dengan sistem existing
- ✅ **Professional Dashboard** untuk monitoring jaringan

**Web interface siap production dan dapat digunakan bersama dengan WhatsApp bot tanpa konflik!** 🚀
