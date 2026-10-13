# PeatFR Explorer (Prediksi Risiko Kebakaran Lahan Gambut Tropis)

Aplikasi web interaktif untuk pemantauan hidrologi lahan gambut, simulasi fluktuasi muka air tanah, imputasi data sensor, dan estimasi **Peat Fire Vulnerability Index (PFVI)**. Proyek ini diadaptasi dari paket R resmi [peatfr](https://github.com/mellygsln/peatfr) (Melly Guslina et al.) dan formulasi riset Taufik et al. (2022) *Agricultural and Forest Meteorology*.

---

## Fitur Utama

1. **Penampang Hidrologi Gambut Tropis (Ilustratif SVG)**
   - Visualisasi lapisan tanah gambut alami: Fibrik (0-40 cm), Hemik (40-120 cm), dan Saprik (>120 cm).
   - Animasi muka air tanah (Water Table) yang responsif terhadap slider kontrol.
   - Penanda garis ambang batas kritis regulasi **PP No. 57/2016 (-0.4 m atau 40 cm)**.
   - Visualisasi bara api bawah tanah (*smoldering ground fire*) saat gambut mengalami kekeringan ekstrem.
   - Kartu keterangan interaktif untuk mempelajari karakteristik setiap lapisan tanah gambut.

2. **Speedometer Gauge Meter PFVI (0 - 300)**
   - Penunjuk indeks risiko kebakaran gambut real-time dengan jarum dinamis.
   - 4 Zona klasifikasi risiko: Rendah (0-75), Sedang (76-150), Tinggi (151-225), dan Ekstrem (226-300).
   - Panduan mitigasi dan tindakan lapangan yang relevan.

3. **Modul Imputasi Data Hilang (Missing Values / NA)**
   - Evaluasi 4 metode estimasi data sensor putus: **k-NN (k = 5)**, **Spline Kubik**, **Interpolasi Linear**, dan **Regresi LOESS (span = 0.5)**.
   - Grafik interaktif perbandingan data asli vs data hasil imputasi.

4. **Modul Peramalan Runtun Waktu (Time Series Forecasting)**
   - Pilihan model stokastik dan rekuren: **ARIMA + Transformasi Box-Cox**, **LSTM**, dan **GRU**.
   - Menampilkan plot kurva penuh dan **Zoom-in 25 titik terakhir** (standar khas paket R `peatfr`).
   - Metrik evaluasi performa model: RMSE, MAE, dan AIC.

5. **Dataset Pengujian Sensor & Unggah CSV**
   - Menggunakan dataset riil dari berkas `src/assets/Data Testing.csv` (192 baris rekaman sensor tanpa data fiktif).
   - Fitur unggah berkas CSV telemetri kustom pengguna secara langsung.
   - Algoritma optimasi simplex Nelder-Mead untuk kalibrasi otomatis parameter Van Genuchten [aH, bH, n, alpha].
   - Fitur ekspor hasil analisis lengkap ke berkas CSV.

6. **Desain Mobile-First & Dua Pilihan Tema**
   - Mendukung tema **Peat Dark** (gelap alami gambut) dan **Field Guide Light** (terang panduan lapangan).
   - Tata letak adaptif dan ramah sentuhan untuk perangkat mobile maupun desktop.

---

## Menjalankan di Lingkungan Pengembangan (Local Development)

### Prasyarat
- Node.js versi 18 atau lebih baru
- npm (Node Package Manager)

### Langkah-Langkah
```bash
# 1. Masuk ke direktori proyek
cd prediksi-kebakaran-gambut

# 2. Pasang dependensi proyek
npm install

# 3. Jalankan server pengembangan Vite
npm run dev
```

Aplikasi dapat diakses melalui peramban di: `http://localhost:5173/`

---

## Panduan Lengkap Deployment di Web Server Apache2

Aplikasi ini dibangun menggunakan Vite dan React yang dikompilasi menjadi berkas web statis (*Single Page Application* / SPA). Oleh karena itu, aplikasi ini **sangat kompatibel dan mudah di-deploy di web server Apache2**.

Berikut adalah langkah-langkah deployment di sistem Linux (Ubuntu / Debian):

### Langkah 1: Kompilasi Berkas Produksi (Production Build)

Jalankan perintah build di direktori proyek:
```bash
npm run build
```

Perintah ini akan menghasilkan direktori `dist/` yang berisi berkas statis teroptimasi (`index.html`, berkas `.css`, `.js`, dan `.htaccess`).

---

### Langkah 2: Aktifkan Modul Apache yang Diperlukan

Aplikasi SPA membutuhkan modul `rewrite` agar URL dapat diarahkan dengan benar ke `index.html`:
```bash
# Aktifkan modul rewrite dan headers (memerlukan hak akses root/sudo)
sudo a2enmod rewrite
sudo a2enmod headers
```

---

### Langkah 3: Siapkan Direktori Web di Server

Buat direktori tujuan di `/var/www/` dan salin berkas hasil build (`dist/`):

```bash
# 1. Buat folder untuk aplikasi
sudo mkdir -p /var/www/peatfr

# 2. Salin seluruh isi folder dist ke folder web server
sudo cp -r dist/* /var/www/peatfr/
sudo cp dist/.htaccess /var/www/peatfr/

# 3. Atur kepemilikan berkas ke pengguna Apache (www-data)
sudo chown -R www-data:www-data /var/www/peatfr

# 4. Atur izin akses direktori
sudo chmod -R 755 /var/www/peatfr
```

---

### Langkah 4: Konfigurasi VirtualHost Apache2

Buat berkas konfigurasi VirtualHost baru untuk aplikasi PeatFR:
```bash
sudo nano /etc/apache2/sites-available/peatfr.conf
```

Tambahkan konfigurasi berikut ke dalam berkas:

```apache
<VirtualHost *:80>
    # Ganti dengan domain Anda atau IP server (contoh: peatfr.local atau 192.168.1.100)
    ServerName peatfr.local
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/peatfr

    <Directory /var/www/peatfr>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Pengaturan Fallback Routing untuk Single Page Application (SPA)
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /
            RewriteRule ^index\.html$ - [L]
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule . /index.html [L]
        </IfModule>
    </Directory>

    # Log error dan akses
    ErrorLog ${APACHE_LOG_DIR}/peatfr_error.log
    CustomLog ${APACHE_LOG_DIR}/peatfr_access.log combined
</VirtualHost>
```

---

### Langkah 5: Aktifkan Situs dan Muat Ulang Apache2

```bash
# 1. Aktifkan konfigurasi VirtualHost baru
sudo a2ensite peatfr.conf

# 2. Uji apakah sintaks konfigurasi Apache valid
sudo apache2ctl configtest
# Respon yang diharapkan: "Syntax OK"

# 3. Muat ulang / restart layanan Apache2
sudo systemctl restart apache2
```

---

### Langkah 6: Pengujian Akses

Buka peramban dan akses alamat yang telah dikonfigurasi:
- Jika menggunakan IP server: `http://IP_SERVER_ANDA/`
- Jika menggunakan nama domain / VirtualHost: `http://peatfr.local/` (pastikan IP telah dipetakan di file `/etc/hosts` klien jika di jaringan lokal)

Aplikasi PeatFR sekarang telah aktif dan berjalan di web server Apache2.

---

## Struktur Direktori Proyek

```text
prediksi-kebakaran-gambut/
├── public/
│   ├── .htaccess                   # Konfigurasi routing rewrite SPA Apache
│   └── favicon.svg                 # Ikon situs bertema hidrologi gambut
├── src/
│   ├── components/
│   │   ├── DatasetWorkbench.jsx    # Eksplorasi data, impor CSV & kalibrasi Nelder-Mead
│   │   ├── Footer.jsx              # Komponen footer aplikasi
│   │   ├── ForecastingView.jsx     # Peramalan runtun waktu (ARIMA, LSTM, GRU)
│   │   ├── HydrologyCycleSVG.jsx   # Diagram alir komputasi hidrologi SVG
│   │   ├── ImputationView.jsx      # Evaluasi 4 metode imputasi data hilang
│   │   ├── InteractiveSandbox.jsx  # Simulator kontrol slider & kurva PFVI
│   │   ├── MethodologyGuide.jsx    # Landasan teori, regulasi & replikasi R
│   │   ├── Navbar.jsx              # Header dan sakelar tema
│   │   ├── PeatlandCrossSectionSVG.jsx # Penampang lahan gambut tropis SVG
│   │   └── PFVIGaugeSVG.jsx        # Gauge meter SVG indeks PFVI
│   ├── data/
│   │   └── sampleDatasets.js       # Data runtun waktu benchmark Riau, Kalteng, Jambi
│   ├── utils/
│   │   └── peatfrMath.js           # Mesin komputasi hidrologi, optimasi, & imputasi
│   ├── App.jsx                     # Komponen induk aplikasi
│   ├── index.css                   # Token desain vanilla CSS & dua tema
│   └── main.jsx                    # Titik masuk React
├── DESIGN.md                       # Panduan gaya visual & token desain
├── package.json                    # Konfigurasi dependensi dan skrip proyek
└── README.md                       # Dokumentasi proyek & panduan deployment
```

---

## Lisensi & Atribusi

Proyek ini menggunakan lisensi terbuka [MIT License](https://opensource.org/licenses/MIT). Algoritma dan metodologi merujuk pada paket R [mellygsln/peatfr](https://github.com/mellygsln/peatfr) serta publikasi Taufik et al. (2022).
