/**
 * Dataset Benchmark Lahan Gambut Tropis Indonesia
 * Berdasarkan karakteristik hidrologi riil kubah gambut Riau, Kalimantan Tengah, dan Jambi
 */

export const SAMPLE_DATASETS = [
  {
    id: 'kampar-riau',
    name: 'Semenanjung Kampar, Riau',
    province: 'Riau',
    ecosystemType: 'Kubah Gambut Dalam (Deep Peat Dome)',
    peatDepth: '5.2 meter',
    description: 'Stasiun hidrologi kubah gambut Kampar. Menunjukkan fase transisi menuju musim kemarau dengan beberapa kekosongan data sensor akibat keterbatasan transmisi telemetri.',
    R0: 2850,
    dt: 1,
    dates: [
      '01 Agu', '02 Agu', '03 Agu', '04 Agu', '05 Agu', '06 Agu', '07 Agu', '08 Agu',
      '09 Agu', '10 Agu', '11 Agu', '12 Agu', '13 Agu', '14 Agu', '15 Agu', '16 Agu',
      '17 Agu', '18 Agu', '19 Agu', '20 Agu', '21 Agu', '22 Agu', '23 Agu', '24 Agu'
    ],
    // Water Table (meter, negatif = di bawah muka tanah)
    WT: [
      -0.22, -0.26, -0.31, null, -0.39, -0.44, -0.48, -0.52,
      -0.56, -0.61, null, -0.69, -0.74, -0.79, -0.83, -0.88,
      -0.92, -0.96, -0.99, -1.04, null, -1.12, -1.15, -1.18
    ],
    // Soil Moisture (% volumetrik)
    SM: [
      62.4, 59.8, 56.1, null, 48.5, 45.2, 42.0, 39.4,
      37.8, 36.1, null, 33.5, 32.1, 31.0, 29.8, 28.5,
      27.9, 27.2, 26.5, 25.8, null, 24.5, 24.1, 23.8
    ],
    // Rainfall (milimeter/hari)
    Rf: [
      12.4, 0.0, 0.0, null, 0.0, 0.0, 1.2, 0.0,
      0.0, 0.0, null, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 2.1, 0.0, 0.0, null, 0.0, 0.0, 0.0
    ],
    // Temperature (°C)
    Temp: [
      30.5, 31.2, 32.0, null, 32.8, 33.5, 33.9, 34.2,
      34.6, 35.0, null, 35.8, 36.2, 36.5, 36.8, 37.1,
      37.0, 35.8, 36.4, 37.2, null, 37.8, 38.1, 38.4
    ]
  },
  {
    id: 'sebangau-kalteng',
    name: 'Sebangau, Kalimantan Tengah',
    province: 'Kalimantan Tengah',
    ecosystemType: 'Lahan Gambut Terdegradasi Kanal (Ex-PLG)',
    peatDepth: '3.8 meter',
    description: 'Zona bekas pembukaan lahan gambut sejuta hektar. Mengalami drainase intensif, muka air tanah anjlok tajam saat tidak ada hujan, memicu risiko kebakaran ekstrem.',
    R0: 2600,
    dt: 1,
    dates: [
      '10 Sep', '11 Sep', '12 Sep', '13 Sep', '14 Sep', '15 Sep', '16 Sep', '17 Sep',
      '18 Sep', '19 Sep', '20 Sep', '21 Sep', '22 Sep', '23 Sep', '24 Sep', '25 Sep',
      '26 Sep', '27 Sep', '28 Sep', '29 Sep', '30 Sep', '01 Okt', '02 Okt', '03 Okt'
    ],
    WT: [
      -0.45, -0.51, -0.58, -0.66, null, -0.79, -0.86, -0.94,
      -1.02, -1.09, -1.16, null, -1.28, -1.33, -1.39, -1.45,
      -1.49, -1.52, -1.55, null, -1.61, -1.64, -1.66, -1.68
    ],
    SM: [
      44.2, 41.0, 38.5, 35.2, null, 30.8, 28.6, 26.4,
      24.8, 23.2, 22.0, null, 20.1, 19.4, 18.8, 18.2,
      17.9, 17.5, 17.1, null, 16.5, 16.2, 16.0, 15.8
    ],
    Rf: [
      0.0, 0.0, 0.0, 0.0, null, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, null, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, null, 0.0, 0.0, 0.0, 0.0
    ],
    Temp: [
      33.2, 33.8, 34.5, 35.1, null, 36.2, 36.8, 37.2,
      37.5, 37.9, 38.2, null, 38.6, 38.9, 39.1, 39.3,
      39.2, 38.8, 39.0, null, 39.5, 39.6, 39.8, 40.0
    ]
  },
  {
    id: 'berbak-jambi',
    name: 'Taman Nasional Berbak, Jambi',
    province: 'Jambi',
    ecosystemType: 'Kawasan Konservasi Gambut Basah (Intact Forest)',
    peatDepth: '4.5 meter',
    description: 'Hutan rawa gambut alami terawat dengan kanopi lebat dan sekat kanal aktif. Muka air tanah tetap terjaga di zona aman batas regulasi PP 57/2016.',
    R0: 3100,
    dt: 1,
    dates: [
      '05 Nov', '06 Nov', '07 Nov', '08 Nov', '09 Nov', '10 Nov', '11 Nov', '12 Nov',
      '13 Nov', '14 Nov', '15 Nov', '16 Nov', '17 Nov', '18 Nov', '19 Nov', '20 Nov',
      '21 Nov', '22 Nov', '23 Nov', '24 Nov', '25 Nov', '26 Nov', '27 Nov', '28 Nov'
    ],
    WT: [
      -0.12, -0.15, -0.18, null, -0.22, -0.20, -0.18, -0.23,
      -0.27, -0.30, null, -0.34, -0.31, -0.26, -0.22, -0.25,
      -0.28, -0.32, null, -0.35, -0.33, -0.29, -0.24, -0.21
    ],
    SM: [
      68.5, 66.8, 65.2, null, 63.4, 64.8, 66.1, 63.0,
      60.8, 58.5, null, 55.4, 57.2, 61.5, 64.2, 62.8,
      60.1, 57.8, null, 55.0, 56.5, 59.8, 63.4, 65.2
    ],
    Rf: [
      18.5, 4.2, 0.0, null, 8.4, 15.2, 22.0, 0.0,
      0.0, 0.0, null, 0.0, 14.8, 28.5, 6.2, 0.0,
      0.0, 0.0, null, 0.0, 12.4, 19.6, 25.1, 14.0
    ],
    Temp: [
      29.1, 29.5, 30.2, null, 29.8, 28.9, 28.4, 30.6,
      31.2, 31.8, null, 32.5, 30.1, 28.7, 29.3, 30.8,
      31.4, 32.0, null, 32.7, 30.5, 29.2, 28.6, 29.0
    ]
  }
];
