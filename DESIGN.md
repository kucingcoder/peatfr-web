# Panduan Desain: Eco-Tech Lahan Gambut Tropis (PeatFR Web)

## 1. Identitas & Karakter
- **Nama Produk**: PeatFR Web (Tropical Peatland Fire Risk & Hydrology Explorer)
- **Tujuan**: Aplikasi web interaktif untuk pemantauan, simulasi hidrologi gambut, imputasi data sensor, dan prediksi risiko kebakaran gambut tropis berbasis paket R `peatfr` (Taufik et al., 2022).
- **Karakter Visual**: Ilmiah, berakar pada alam gambut Indonesia, edukatif, presisi, dan responsif (mobile-first).

## 2. Dials Antislop
- **ENERGY**: 2 (Seimbang: profesional, informatif, visual ilustratif hidup tanpa berlebihan)
- **RHYTHM**: 2 (Berirama: transisi antar bagian modular dengan visual penampang tanah gambut sebagai jangkar utama)
- **MOTION**: 2 (Fungsional: animasi transisi SVG muka air, jarum gauge risiko, slider reaktif, dan grafik data tanpa perulangan tak berujung)

## 3. Palet Warna (Eco Peat Palette)
- **Tema Gelap (Peat Dark)**:
  - Latar Belakang Utama: `#0c1410` (Hutan Gambut Malam / Peat Canopy Night)
  - Latar Permukaan / Card: `#131f19` (Gambut Dalam)
  - Card Border / Garis: `#203328` (Lichen Green Slate)
  - Teks Utama: `#e3ece7` (Fog Mist, rasio kontras > 11:1 terhadap latar)
  - Teks Sekunder: `#9cb1a4` (Pale Peat Reed, rasio kontras > 4.8:1)
  - Aksen Alam (Gambut Sehat / Aman): `#22c55e` (Lush Moss)
  - Aksen Air Gambut (Muka Air): `#38bdf8` / `#0284c7` (Water Table Blue)
  - Aksen Tanah Gambut Organik: `#92400e` (Peat Soil Amber)
  - Peringatan / Bahaya Kebakaran:
    - Sedang: `#eab308` (Waspada)
    - Tinggi: `#f97316` (Tinggi)
    - Ekstrem: `#ef4444` (Ekstrem)

- **Tema Terang (Field Guide Light)**:
  - Latar Belakang Utama: `#f4f7f5` (Kertas Lapangan Tropis)
  - Latar Permukaan / Card: `#ffffff` (White Slate)
  - Card Border / Garis: `#d2ddd6`
  - Teks Utama: `#111f18` (Deep Charcoal Moss, rasio kontras > 12:1)
  - Teks Sekunder: `#475e52` (rasio kontras > 5:1)
  - Aksen Muka Air: `#0284c7`
  - Aksen Aman: `#16a34a`
  - Aksen Api / Bahaya: `#dc2626`

## 4. Tipografi
- **Headings & Tampilan**: `Plus Jakarta Sans`, sans-serif (font modern Indonesia dengan keterbacaan tinggi dan bentuk huruf ramah)
- **Body Text**: `Inter`, sans-serif (keterbacaan optimal pada teks ilmiah dan tabel data)
- **Data & Formula**: `JetBrains Mono`, monospace (hanya untuk nilai metrik sensor, matriks parameter, dan formula matematika)

## 5. Ilustrasi SVG
- Penampang tanah gambut tropis dinamis dengan lapisan vegetasi kanopi, lapisan fibrik (0-40cm), lapisan hemik (40-120cm), lapisan saprik (>120cm), garis batas kritis PP 57/2016 (-0.4m), serta visualisasi fluktuasi muka air tanah.
- Gauge meter risiko kebakaran Peat Fire Vulnerability Index (PFVI 0 - 300).
- Diagram alur estimasi stokastik dan machine learning (Imputasi sensor -> ARIMA/LSTM/GRU -> Nelder-Mead -> PFVI).
- Grafik interaktif kurva runtun waktu dan sebaran data sensor.
