
# Rekening Donasi Untuk Pembangunan Masjid
# 4206 0101 2214 534 BRI an DKM BAITUR ROHMAN

Web interface modern dan responsive untuk sistem monitoring jaringan yang terintegrasi dengan WhatsApp Bot, GenieACS, dan MikroTik.

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

## Cara Instalasi
```bash
npm install pm2 -g
```
```
apt install git curl -y
```
```bash
git clone https://github.com/frans1705/genieacs-mikrotik.git
```
```
cd genieacs-mikrotik
```
### 1. Install Dependensi

```bash
npm install
```
### 2. Konfigurasi Environment Variables

Salin file `.env.example` menjadi `.env` dan sesuaikan:

```bash
cp env-example.txt .env
```

Edit file `.env` dengan pengaturan yang sesuai:

```
# Konfigurasi Server
PORT=4500
HOST=localhost

# Konfigurasi Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password

# Konfigurasi GenieACS
GENIEACS_URL=http://your-genieacs-server:7557
GENIEACS_USERNAME=username
GENIEACS_PASSWORD=password

# Konfigurasi Mikrotik (opsional)
MIKROTIK_HOST=192.168.1.1
MIKROTIK_PORT=8728
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=password

# Konfigurasi WhatsApp
ADMIN_NUMBER=6281234567890
TECHNICIAN_NUMBERS=6281234567890,6287654321098
WHATSAPP_SESSION_PATH=./whatsapp-session
WHATSAPP_KEEP_ALIVE=true
WHATSAPP_RESTART_ON_ERROR=true
```

### 3. Menjalankan Aplikasi

```bash
npm start
atau
pm2 start app-whatsapp-only.js
```

Scan QR code yang muncul di terminal untuk login WhatsApp.<br>
siapkan dua nomer whatsapp <br>
untuk scan QRCode sebagai BOT <br>
untuk perintah ADMIN 

## Perintah WhatsApp

### Perintah untuk Pelanggan

#### Perintah Dasar
- `menu` - Menampilkan menu bantuan
- `status` - Cek status perangkat
- `refresh` - Refresh data perangkat

#### Manajemen WiFi
- `gantiwifi [nama]` - Ganti nama WiFi
- `gantipass [password]` - Ganti password WiFi
- `info wifi` - Lihat informasi WiFi

#### Monitoring & Diagnostik
- `devices` / `connected` - Lihat perangkat terhubung WiFi
- `speedtest` / `bandwidth` - Info bandwidth perangkat
- `diagnostic` / `diagnosa` - Diagnostik jaringan
- `history` / `riwayat` - Riwayat koneksi

#### Kontrol Perangkat
- `restart` - Restart perangkat (perlu konfirmasi dengan "ya")
- `factory reset` - Factory reset perangkat (perlu konfirmasi)

### Perintah untuk Admin

#### Manajemen Perangkat GenieACS
- Semua perintah pelanggan
- `admin` - Menampilkan menu admin
- `cek [nomor]` - Cek status ONU pelanggan
- `detail [nomor]` - Detail lengkap perangkat pelanggan
- `
