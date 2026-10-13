import React, { useState } from 'react';

/**
 * PeatlandCrossSectionSVG
 * Ilustrasi Penampang Lahan Gambut Tropis Dinamis Berbasis SVG
 * Memvisualisasikan kanopi hutan, lapisan fibrik-hemik-saprik,
 * fluktuasi muka air tanah, garis kritis PP 57/2016 (-0.4m),
 * serta bahaya bara api bawah tanah (smoldering fire).
 *
 * Label lapisan dirender di atas lapisan air dengan kontras tinggi (WCAG AAA)
 * sehingga tetap terbaca sangat jelas dan tajam saat air penuh.
 */
export default function PeatlandCrossSectionSVG({
  waterTable = -0.55, // meter, e.g. -0.1 to -1.5
  soilMoisture = 42,   // %
  temperature = 33,    // °C
  rainfall = 0         // mm
}) {
  const [selectedLayer, setSelectedLayer] = useState(null);

  // Normalisasi kedalaman muka air ke koordinat Y SVG
  // Muka tanah berada di Y = 160 (0.0 m)
  // Dasar penampang di Y = 460 (-1.5 m)
  // Rentang 300px untuk 1.5 meter -> 200px per meter
  const groundY = 160;
  const bottomY = 460;
  const pixelsPerMeter = 200;

  // Kedalaman muka air tanah (WT biasanya negatif, misal -0.65m)
  const currentDepthM = Math.max(0, Math.min(1.5, Math.abs(waterTable)));
  const waterLevelY = groundY + currentDepthM * pixelsPerMeter;

  // Garis kritis regulasi PP 57/2016: -0.4 m
  const criticalY = groundY + 0.4 * pixelsPerMeter; // Y = 240

  // Apakah kondisi rawan terbakar?
  const isBelowCritical = currentDepthM > 0.4;
  const isExtremeDrying = currentDepthM > 0.75 && soilMoisture < 35;

  return (
    <div className="svg-diagram-card" aria-label="Ilustrasi Penampang Lahan Gambut Tropis">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Penampang Hidrologi Lahan Gambut Tropis</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Visualisasi interaktif muka air tanah dan zonasi kedalaman gambut
          </p>
        </div>

        {/* Status Indikator PP 57/2016 */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '0.78rem',
          fontWeight: '700',
          backgroundColor: isBelowCritical ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
          color: isBelowCritical ? 'var(--risk-high)' : 'var(--risk-low)',
          border: `1px solid ${isBelowCritical ? 'rgba(249, 115, 22, 0.35)' : 'rgba(34, 197, 94, 0.35)'}`
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isBelowCritical ? 'var(--risk-high)' : 'var(--risk-low)'
          }} />
          <span>{isBelowCritical ? 'Di Bawah Batas PP 57/2016 (-0.4m)' : 'Muka Air Aman (≥ -0.4m)'}</span>
        </div>
      </div>

      <svg
        viewBox="0 0 680 490"
        className="svg-responsive-container"
        style={{ width: '100%', height: 'auto', borderRadius: '12px', background: 'var(--bg-primary)' }}
      >
        <defs>
          {/* Shadow Filter untuk Label agar Selalu Kontras Maksimal */}
          <filter id="labelShadow" x="-10%" y="-15%" width="125%" height="135%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.75" />
          </filter>

          {/* Gradient Langit */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d1b14" />
            <stop offset="100%" stopColor="#1a2d22" />
          </linearGradient>

          {/* Gradient Lapisan Fibrik (0 - 40 cm) */}
          <linearGradient id="fibricDryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#633924" />
            <stop offset="100%" stopColor="#4e2c1a" />
          </linearGradient>

          {/* Gradient Lapisan Hemik (40 - 120 cm) */}
          <linearGradient id="hemicGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3d2113" />
            <stop offset="100%" stopColor="#2c170d" />
          </linearGradient>

          {/* Gradient Lapisan Saprik (> 120 cm) */}
          <linearGradient id="sapricGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#241108" />
            <stop offset="100%" stopColor="#140803" />
          </linearGradient>

          {/* Gradient Zona Jenuh Air Gambut */}
          <linearGradient id="peatWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.84" />
            <stop offset="35%" stopColor="#0369a1" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#075985" stopOpacity="0.94" />
          </linearGradient>

          {/* Pattern Serat Gambut Organik */}
          <pattern id="peatFibers" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M2,4 Q8,10 14,3 M6,14 Q12,18 18,12" stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.08" fill="none" />
          </pattern>
        </defs>

        {/* 1. Langit & Atmosfer (Y: 0 - 160) */}
        <rect x="0" y="0" width="680" height="160" fill="url(#skyGrad)" />

        {/* Indikator Hujan jika ada */}
        {rainfall > 0 && (
          <g opacity="0.75">
            <line x1="80" y1="20" x2="70" y2="70" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 6" />
            <line x1="140" y1="15" x2="130" y2="65" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 6" />
            <line x1="220" y1="25" x2="210" y2="75" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 6" />
            <line x1="340" y1="10" x2="330" y2="60" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 6" />
            <line x1="480" y1="20" x2="470" y2="70" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 6" />
            <line x1="580" y1="15" x2="570" y2="65" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 6" />
            <text x="50" y="30" fill="#38bdf8" fontSize="11" fontFamily="var(--font-mono)">
              Hujan: {rainfall} mm/hari
            </text>
          </g>
        )}

        {/* Indikator Suhu & Radiasi Matahari */}
        <g transform="translate(560, 25)">
          <circle cx="20" cy="20" r="16" fill="#f59e0b" fillOpacity="0.2" />
          <circle cx="20" cy="20" r="10" fill="#f59e0b" />
          <text x="42" y="24" fill="var(--text-primary)" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">
            {temperature}°C
          </text>
        </g>

        {/* Vegetasi Kanopi Rawa Gambut (Pohon Jelutung, Pakis, Ramin) */}
        <g id="vegetation">
          {/* Pohon 1 (Kiri) */}
          <rect x="75" y="65" width="8" height="95" fill="#382115" rx="2" />
          <path d="M40,110 Q79,40 118,110 Q79,80 40,110 Z" fill="#166534" />
          <path d="M48,85 Q79,30 110,85 Q79,60 48,85 Z" fill="#15803d" />

          {/* Pohon 2 (Tengah) */}
          <rect x="260" y="55" width="10" height="105" fill="#43281c" rx="2" />
          <path d="M220,100 Q265,25 310,100 Q265,70 220,100 Z" fill="#166534" />
          <path d="M230,75 Q265,15 300,75 Q265,50 230,75 Z" fill="#22c55e" />

          {/* Pohon 3 (Kanan) */}
          <rect x="490" y="60" width="9" height="100" fill="#382115" rx="2" />
          <path d="M450,105 Q495,35 540,105 Q495,75 450,105 Z" fill="#15803d" />
          <path d="M460,80 Q495,20 530,80 Q495,55 460,80 Z" fill="#22c55e" />

          {/* Pakis dan Semak Belukar Lahan Gambut */}
          <path d="M110,160 Q120,135 135,145 Q125,155 120,160 Z" fill="#15803d" />
          <path d="M180,160 Q195,140 210,150 Q195,158 190,160 Z" fill="#16a34a" />
          <path d="M370,160 Q385,138 400,152 Q385,158 380,160 Z" fill="#15803d" />
          <path d="M430,160 Q440,130 460,145 Q445,155 440,160 Z" fill="#22c55e" />
          <path d="M600,160 Q615,135 630,150 Q615,158 610,160 Z" fill="#16a34a" />
        </g>

        {/* Garis Permukaan Tanah (Muka Gambut 0.0 m) */}
        <line x1="0" y1={groundY} x2="680" y2={groundY} stroke="#15803d" strokeWidth="4" />
        <rect x="0" y={groundY} width="680" height="8" fill="#166534" opacity="0.6" />

        {/* 2. LATAR MATRIKS TANAH GAMBUT (Y: 160 - 460) */}
        {/* Lapisan Fibrik Matriks (0 - 40 cm -> Y: 160 s/d 240) */}
        <g id="fibricLayerBg">
          <rect x="0" y="160" width="680" height="80" fill="url(#fibricDryGrad)" />
          <rect x="0" y="160" width="680" height="80" fill="url(#peatFibers)" />
        </g>

        {/* Lapisan Hemik Matriks (40 - 120 cm -> Y: 240 s/d 400) */}
        <g id="hemicLayerBg">
          <rect x="0" y="240" width="680" height="160" fill="url(#hemicGrad)" />
          <rect x="0" y="240" width="680" height="160" fill="url(#peatFibers)" opacity="0.7" />
          <line x1="0" y1="240" x2="680" y2="240" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
        </g>

        {/* Lapisan Saprik Matriks (> 120 cm -> Y: 400 s/d 460) */}
        <g id="sapricLayerBg">
          <rect x="0" y="400" width="680" height="60" fill="url(#sapricGrad)" />
          <line x1="0" y1="400" x2="680" y2="400" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
        </g>

        {/* 3. ZONA JENUH AIR GAMBUT (Di Bawah Muka Air Tanah Y = waterLevelY) */}
        {waterLevelY < bottomY && (
          <g id="waterTableZone">
            <rect
              x="0"
              y={waterLevelY}
              width="680"
              height={bottomY - waterLevelY}
              fill="url(#peatWaterGrad)"
            />
            {/* Garis Gelombang Muka Air */}
            <path
              d={`M0,${waterLevelY} Q170,${waterLevelY - 3} 340,${waterLevelY} T680,${waterLevelY}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
            />
            <line
              x1="0"
              y1={waterLevelY}
              x2="680"
              y2={waterLevelY}
              stroke="#7dd3fc"
              strokeWidth="1"
              strokeDasharray="6 3"
              opacity="0.8"
            />
          </g>
        )}

        {/* 4. GARIS BATAS KRITIS PP 57/2016 (-0.4 m / Y = 240) */}
        <g id="criticalThresholdLine">
          <line
            x1="0"
            y1={criticalY}
            x2="680"
            y2={criticalY}
            stroke="#f97316"
            strokeWidth="2.5"
            strokeDasharray="8 6"
          />
          <rect
            x="440"
            y={criticalY - 14}
            width="225"
            height="26"
            rx="6"
            fill="rgba(15, 23, 42, 0.92)"
            stroke="#f97316"
            strokeWidth="1.2"
            filter="url(#labelShadow)"
          />
          <text x="452" y={criticalY + 3} fill="#fdba74" fontSize="11" fontWeight="700">
            Batas Kritis PP 57/2016: -0.4 m
          </text>
        </g>

        {/* 5. INDIKATOR BARA API BAWAH TANAH (Smoldering Fire) JIKA SANGAT KERING */}
        {isExtremeDrying && (
          <g id="smolderingEmbers">
            <circle cx="200" cy="190" r="14" fill="#ef4444" fillOpacity="0.4" />
            <circle cx="200" cy="190" r="8" fill="#f97316" />
            <circle cx="200" cy="190" r="4" fill="#fef08a" />

            <circle cx="380" cy="210" r="16" fill="#ef4444" fillOpacity="0.4" />
            <circle cx="380" cy="210" r="9" fill="#f97316" />
            <circle cx="380" cy="210" r="4" fill="#fef08a" />

            <circle cx="490" cy="195" r="12" fill="#ef4444" fillOpacity="0.4" />
            <circle cx="490" cy="195" r="7" fill="#f97316" />
            <circle cx="490" cy="195" r="3" fill="#fef08a" />

            {/* Asap tipis mengepul ke permukaan */}
            <path d="M200,180 Q190,150 205,120 T200,90" fill="none" stroke="#94a3b8" strokeWidth="3" opacity="0.6" strokeDasharray="4 4" />
            <path d="M380,200 Q370,160 385,130 T378,95" fill="none" stroke="#94a3b8" strokeWidth="3.5" opacity="0.6" strokeDasharray="4 4" />
            <path d="M490,185 Q480,155 495,125 T490,95" fill="none" stroke="#94a3b8" strokeWidth="2.5" opacity="0.6" strokeDasharray="4 4" />

            {/* Kotak Peringatan Bara Api */}
            <rect x="220" y="80" width="220" height="28" rx="6" fill="#ef4444" filter="url(#labelShadow)" />
            <text x="232" y="98" fill="#ffffff" fontSize="11" fontWeight="800">
              BAHAYA: Bara Gambut Bawah Tanah!
            </text>
          </g>
        )}

        {/* 6. LABEL KARTU LAPISAN GAMBUT (DIRENDER DI ATAS AIR DENGAN KONTRAS TINGGI) */}
        <g id="layerLabelsLayer">
          {/* Label Lapisan Fibrik (0 - 40 cm) */}
          <g
            onClick={() => setSelectedLayer({
              title: 'Lapisan Gambut Fibrik (0 - 40 cm)',
              desc: 'Lapisan gambut paling atas dengan dekomposisi rendah. Mengandung serat tumbuhan utuh, sangat berpori. Jika muka air tanah turun di bawah lapisan ini, gambut cepat mengering dan menjadi bahan bakar potensial.'
            })}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x="14"
              y="174"
              width="240"
              height="48"
              rx="8"
              fill="rgba(12, 22, 17, 0.92)"
              stroke="rgba(251, 191, 36, 0.45)"
              strokeWidth="1.2"
              filter="url(#labelShadow)"
            />
            {/* Strip Aksen Warna Amber */}
            <rect x="14" y="174" width="4.5" height="48" rx="2" fill="#f59e0b" />
            <text x="26" y="194" fill="#ffffff" fontSize="12" fontWeight="700">
              Lapisan Fibrik (0 s/d 40 cm)
            </text>
            <text x="26" y="210" fill="#fde68a" fontSize="10.5" fontWeight="500">
              Porositas tinggi, dekomposisi awal
            </text>
          </g>

          {/* Label Lapisan Hemik (40 - 120 cm) */}
          <g
            onClick={() => setSelectedLayer({
              title: 'Lapisan Gambut Hemik (40 - 120 cm)',
              desc: 'Lapisan gambut peralihan dengan dekomposisi sedang. Sebagian serat telah hancur membentuk massa amorf. Menjadi zona penahan air utama di kawasan kubah gambut.'
            })}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x="14"
              y="294"
              width="240"
              height="48"
              rx="8"
              fill="rgba(12, 22, 17, 0.92)"
              stroke="rgba(56, 189, 248, 0.5)"
              strokeWidth="1.2"
              filter="url(#labelShadow)"
            />
            {/* Strip Aksen Warna Cyan Air */}
            <rect x="14" y="294" width="4.5" height="48" rx="2" fill="#38bdf8" />
            <text x="26" y="314" fill="#ffffff" fontSize="12" fontWeight="700">
              Lapisan Hemik (40 s/d 120 cm)
            </text>
            <text x="26" y="330" fill="#bae6fd" fontSize="10.5" fontWeight="500">
              Dekomposisi sedang, penahan air
            </text>
          </g>

          {/* Label Lapisan Saprik (> 120 cm) */}
          <g
            onClick={() => setSelectedLayer({
              title: 'Lapisan Gambut Saprik (> 120 cm)',
              desc: 'Lapisan gambut terdalam dengan tingkat kematangan tinggi (dekomposisi lanjut). Menyerupai lumpur hitam padat dengan kandungan karbon organik sangat tinggi.'
            })}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x="14"
              y="408"
              width="240"
              height="44"
              rx="8"
              fill="rgba(12, 22, 17, 0.92)"
              stroke="rgba(192, 132, 252, 0.5)"
              strokeWidth="1.2"
              filter="url(#labelShadow)"
            />
            {/* Strip Aksen Warna Ungu Karbon */}
            <rect x="14" y="408" width="4.5" height="44" rx="2" fill="#c084fc" />
            <text x="26" y="426" fill="#ffffff" fontSize="12" fontWeight="700">
              Lapisan Saprik (&gt; 120 cm)
            </text>
            <text x="26" y="442" fill="#e9d5ff" fontSize="10.5" fontWeight="500">
              Dekomposisi lanjut, endapan karbon masif
            </text>
          </g>
        </g>

        {/* 7. LABEL & PENANDA MUKA AIR TANAH AKTIF (Diposisikan di Kanal Tengah x = 265) */}
        <g
          id="waterTableBadge"
          transform={`translate(265, ${Math.min(bottomY - 32, Math.max(groundY + 8, waterLevelY - 16))})`}
          filter="url(#labelShadow)"
        >
          <rect
            x="0"
            y="0"
            width="220"
            height="30"
            rx="7"
            fill="#0284c7"
            stroke="#7dd3fc"
            strokeWidth="1.5"
          />
          <circle cx="14" cy="15" r="4" fill="#38bdf8" />
          <text x="26" y="19" fill="#ffffff" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)">
            Muka Air: {waterTable.toFixed(2)} m ({Math.round(currentDepthM * 100)} cm)
          </text>
        </g>

        {/* Skala Kedalaman Penggaris Metrik (Sisi Kanan) dengan Kontras Tinggi */}
        <g id="rulerScale" transform="translate(640, 0)">
          <line x1="0" y1="160" x2="0" y2="460" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="2" />
          <line x1="-8" y1="160" x2="0" y2="160" stroke="#22c55e" strokeWidth="2.5" />
          <text x="-34" y="164" fill="#ffffff" fontSize="10.5" fontWeight="700" filter="url(#labelShadow)">0.0m</text>

          <line x1="-8" y1="240" x2="0" y2="240" stroke="#f97316" strokeWidth="2.5" />
          <text x="-38" y="244" fill="#fed7aa" fontSize="10.5" fontWeight="700" filter="url(#labelShadow)">-0.4m</text>

          <line x1="-8" y1="320" x2="0" y2="320" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
          <text x="-38" y="324" fill="#e2e8f0" fontSize="10" fontWeight="600" filter="url(#labelShadow)">-0.8m</text>

          <line x1="-8" y1="400" x2="0" y2="400" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
          <text x="-38" y="404" fill="#e2e8f0" fontSize="10" fontWeight="600" filter="url(#labelShadow)">-1.2m</text>

          <line x1="-8" y1="460" x2="0" y2="460" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="2" />
          <text x="-38" y="464" fill="#ffffff" fontSize="10.5" fontWeight="700" filter="url(#labelShadow)">-1.5m</text>
        </g>
      </svg>

      {/* Modal / Keterangan Lapisan yang Dipilih */}
      {selectedLayer && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{selectedLayer.title}</h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{selectedLayer.desc}</p>
          </div>
          <button
            onClick={() => setSelectedLayer(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              lineHeight: 1,
              padding: '2px 6px'
            }}
            aria-label="Tutup keterangan lapisan"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
