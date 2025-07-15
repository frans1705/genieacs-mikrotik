
# Rekening Donasi Untuk Pembanguanan Masjid
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
git clone https://github.com/alijayanet/genieacs-mikrotik
```
```
cd genieacs-mikrotik
```
### 1. Install Dependensi

```bash
npm install
```

### 3. Menjalankan Aplikasi

```bash
pm2 start app-whatsapp-only.js
```

Scan QR code di web setting admin<br>
## link akses web admin
ipserver:3100/admin<br>
## link akses pelanggan
ipserver:3100<br>

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
- `list` - Daftar semua ONU
- `cekall` - Cek status semua ONU
- `editssid [nomor] [ssid]` - Edit SSID pelanggan
- `editpass [nomor] [password]` - Edit password WiFi pelanggan
- `adminrestart [nomor]` - Restart perangkat pelanggan
- `adminfactory [nomor]` - Factory reset perangkat pelanggan
- `addtag [device_id] [nomor]` - Tambahkan nomor pelanggan ke perangkat
- `addpppoe_tag [pppoe_username] [nomor]` - Tambahkan nomor pelanggan berdasarkan PPPoE
- `addwan [nomor] [tipe] [mode]` - Tambah konfigurasi WAN

#### Manajemen Hotspot
- `addhotspot [user] [pass] [profile]` - Tambah user hotspot
- `delhotspot [user]` - Hapus user hotspot
- `hotspot` - Lihat user hotspot aktif

#### Manajemen PPPoE
- `addpppoe [user] [pass] [profile] [ip]` - Tambah secret PPPoE
- `delpppoe [user]` - Hapus secret PPPoE
- `setprofile [user] [profile]` - Ubah profile PPPoE
- `pppoe` - Lihat koneksi PPPoE aktif
- `offline` - Lihat user PPPoE offline

#### Manajemen Interface
- `interfaces` - Daftar semua interface
- `interface [nama]` - Detail interface tertentu
- `enableif [nama]` - Aktifkan interface
- `disableif [nama]` - Nonaktifkan interface

#### Manajemen IP & Route
- `ipaddress` - Daftar IP address
- `routes` - Daftar routing table
- `dhcp` - Daftar DHCP leases

#### Manajemen User & Profile
- `users` - Ringkasan semua user
- `profiles [type]` - Daftar profile (pppoe/hotspot/all)

#### Firewall & Security
- `firewall [chain]` - Daftar firewall rules

#### Tools & Monitoring
- `ping [host] [count]` - Ping ke host
- `logs [topics] [count]` - System logs
- `resource` - Info resource router
- `clock` - Waktu router
- `identity [nama]` - Identity router

#### System Management
- `reboot` - Restart router (perlu konfirmasi dengan "confirm restart")

#### Notifikasi PPPoE
- `pppoe on` - Aktifkan notifikasi PPPoE login/logout
- `pppoe off` - Nonaktifkan notifikasi PPPoE
- `pppoe status` - Status notifikasi PPPoE
- `pppoe addadmin [nomor]` - Tambah nomor admin untuk notifikasi
- `pppoe addtech [nomor]` - Tambah nomor teknisi untuk notifikasi
- `pppoe interval [detik]` - Ubah interval monitoring (30-3600 detik)
- `pppoe test` - Test notifikasi

## Contoh Penggunaan Perintah Baru

### Perintah GenieACS untuk Pelanggan

#### Monitoring & Diagnostik
```
devices                      # Lihat perangkat terhubung WiFi
speedtest                    # Info bandwidth perangkat
diagnostic                   # Diagnostik jaringan lengkap
history                      # Riwayat koneksi perangkat
```

#### Kontrol Perangkat
```
restart                      # Restart perangkat
ya                          # Konfirmasi restart

factory reset               # Factory reset perangkat
confirm factory reset       # Konfirmasi factory reset
```

### Perintah GenieACS untuk Admin

#### Manajemen Perangkat
```
detail 081234567890         # Detail lengkap perangkat pelanggan
adminrestart 081234567890   # Restart perangkat pelanggan
adminfactory 081234567890   # Factory reset perangkat pelanggan
confirm admin factory reset 081234567890  # Konfirmasi factory reset
```

### Interface Management (MikroTik)
```
interfaces                    # Lihat semua interface
interface ether1             # Detail interface ether1
enableif wlan1               # Aktifkan interface wlan1
disableif ether2             # Nonaktifkan interface ether2
```

### Network Management
```
ipaddress                    # Lihat semua IP address
routes                       # Lihat routing table
dhcp                         # Lihat DHCP leases
```

### Monitoring & Tools
```
ping 8.8.8.8                # Ping ke Google DNS
ping google.com 10           # Ping ke Google 10 kali
logs                         # Lihat system logs
logs dhcp 30                 # Lihat 30 log DHCP terbaru
```

### User & Profile Management
```
users                        # Ringkasan semua user
profiles                     # Lihat semua profile
profiles pppoe               # Lihat profile PPPoE saja
profiles hotspot             # Lihat profile Hotspot saja
```

### System Management
```
clock                        # Lihat waktu router
identity                     # Lihat identity router
identity MyRouter            # Set identity router
reboot                       # Restart router (perlu konfirmasi)
confirm restart              # Konfirmasi restart
```

### Notifikasi PPPoE
```
pppoe status                 # Lihat status notifikasi
pppoe on                     # Aktifkan notifikasi
pppoe off                    # Nonaktifkan notifikasi
pppoe addadmin 081234567890  # Tambah nomor admin
pppoe addtech 081234567890   # Tambah nomor teknisi
pppoe interval 60            # Set interval 60 detik
pppoe test                   # Test notifikasi
```
