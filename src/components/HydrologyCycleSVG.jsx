import React, { useState } from 'react';

/**
 * HydrologyCycleSVG
 * Diagram Alir Matematika & Siklus Hidrologi Lahan Gambut
 * Menjelaskan alur komputasi paket peatfr (Taufik et al., 2022)
 */
export default function HydrologyCycleSVG() {
  const [activeStage, setActiveStage] = useState('equation');

  const stageData = {
    sensors: {
      title: '1. Masukan Parameter Lingkungan Gambut',
      content: 'Empat variabel sensor utama diukur secara harian: Muka Air Tanah (WT, meter), Kelembaban Tanah (SM, %), Curah Hujan (Rf, mm), dan Suhu Udara (Temp, °C). Jika terdapat sensor yang putus, dilakukan imputasi terlebih dahulu.'
    },
    equation: {
      title: '2. Persamaan Neraca Kekeringan Gambut (PFVI)',
      content: 'Persamaan pembaruan status: x(t+1) = x(t) + DF(t) - RF(t) - WTF(t). DF menghitung laju pengeringan akibat suhu harian. RF mengurangi indeks saat terjadi hujan efektif. WTF memodelkan retensi air hisap tanah dengan persamaan Van Genuchten.'
    },
    optimization: {
      title: '3. Optimasi Simplex Nelder-Mead',
      content: 'Parameter retensi tanah [aH, bH, n, alpha] dikalibrasi otomatis menggunakan algoritma Nelder-Mead simplex untuk meminimalkan selisih kuadrat (MSE) antara indeks hasil simulasi dengan indeks kekeringan teramati (DIobs).'
    },
    risk: {
      title: '4. Klasifikasi Kerentanan & Mitigasi Lapangan',
      content: 'Nilai PFVI akhir (0 - 300) diklasifikasikan ke dalam 4 kuadran risiko: Rendah (0-75), Sedang (76-150), Tinggi (151-225), dan Ekstrem (226-300) untuk memicu peringatan dini dan tindakan restorasi gambut (rewetting).'
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 className="card-title">Diagram Alir Komputasi Hidrologi Gambut (peatfr)</h3>
          <p className="card-subtitle">Klik tahapan pada diagram untuk membaca dasar teori dan persamaannya</p>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {Object.keys(stageData).map(k => (
            <button
              key={k}
              className={`btn btn-secondary ${activeStage === k ? 'btn-primary' : ''}`}
              style={{ minHeight: '36px', padding: '4px 10px', fontSize: '0.78rem' }}
              onClick={() => setActiveStage(k)}
            >
              Tahap {k === 'sensors' ? '1' : k === 'equation' ? '2' : k === 'optimization' ? '3' : '4'}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox="0 0 760 210"
        className="svg-responsive-container"
        style={{ width: '100%', height: 'auto', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}
        aria-label="Diagram Alir Model Hidrologi PeatFR"
      >
        <defs>
          {/* Arrowhead marker */}
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-moss)" />
          </marker>
        </defs>

        {/* 1. Kotak Sensor Inputs */}
        <g
          transform="translate(15, 25)"
          onClick={() => setActiveStage('sensors')}
          style={{ cursor: 'pointer' }}
          opacity={activeStage === 'sensors' ? 1 : 0.75}
        >
          <rect
            x="0" y="0" width="150" height="155" rx="8"
            fill="var(--bg-card)"
            stroke={activeStage === 'sensors' ? 'var(--color-moss)' : 'var(--border-medium)'}
            strokeWidth={activeStage === 'sensors' ? '2' : '1'}
          />
          <text x="14" y="24" fill="var(--text-primary)" fontSize="11" fontWeight="700">1. Parameter Sensor</text>
          <line x1="14" y1="32" x2="136" y2="32" stroke="var(--border-subtle)" />
          <text x="14" y="52" fill="var(--color-water)" fontSize="10" fontFamily="var(--font-mono)">WT: Muka Air (m)</text>
          <text x="14" y="74" fill="#10b981" fontSize="10" fontFamily="var(--font-mono)">SM: Kelembaban (%)</text>
          <text x="14" y="96" fill="#38bdf8" fontSize="10" fontFamily="var(--font-mono)">Rf: Hujan (mm)</text>
          <text x="14" y="118" fill="#f59e0b" fontSize="10" fontFamily="var(--font-mono)">Temp: Suhu (°C)</text>
          <text x="14" y="142" fill="var(--text-muted)" fontSize="9">Imputasi jika NA</text>
        </g>

        {/* Panah 1 -> 2 */}
        <line x1="168" y1="102" x2="200" y2="102" stroke="var(--color-moss)" strokeWidth="2" markerEnd="url(#arrow)" />

        {/* 2. Kotak Persamaan Neraca Hidrologi */}
        <g
          transform="translate(208, 25)"
          onClick={() => setActiveStage('equation')}
          style={{ cursor: 'pointer' }}
          opacity={activeStage === 'equation' ? 1 : 0.75}
        >
          <rect
            x="0" y="0" width="180" height="155" rx="8"
            fill="var(--bg-card)"
            stroke={activeStage === 'equation' ? 'var(--color-moss)' : 'var(--border-medium)'}
            strokeWidth={activeStage === 'equation' ? '2' : '1'}
          />
          <text x="14" y="24" fill="var(--text-primary)" fontSize="11" fontWeight="700">2. Persamaan Hidrologi</text>
          <line x1="14" y1="32" x2="166" y2="32" stroke="var(--border-subtle)" />
          <text x="14" y="52" fill="#eab308" fontSize="10" fontFamily="var(--font-mono)">DF: Laju Kekeringan</text>
          <text x="14" y="74" fill="#0ea5e9" fontSize="10" fontFamily="var(--font-mono)">RF: Reduksi Hujan</text>
          <text x="14" y="96" fill="#f97316" fontSize="10" fontFamily="var(--font-mono)">WTF: Van Genuchten</text>
          <rect x="10" y="110" width="160" height="34" rx="4" fill="var(--bg-primary)" />
          <text x="18" y="132" fill="var(--text-primary)" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">
            xt+1 = xt + DF - RF - WTF
          </text>
        </g>

        {/* Panah 2 -> 3 */}
        <line x1="392" y1="102" x2="424" y2="102" stroke="var(--color-moss)" strokeWidth="2" markerEnd="url(#arrow)" />

        {/* 3. Kotak Nelder-Mead Optimization */}
        <g
          transform="translate(432, 25)"
          onClick={() => setActiveStage('optimization')}
          style={{ cursor: 'pointer' }}
          opacity={activeStage === 'optimization' ? 1 : 0.75}
        >
          <rect
            x="0" y="0" width="150" height="155" rx="8"
            fill="var(--bg-card)"
            stroke={activeStage === 'optimization' ? 'var(--color-moss)' : 'var(--border-medium)'}
            strokeWidth={activeStage === 'optimization' ? '2' : '1'}
          />
          <text x="14" y="24" fill="var(--text-primary)" fontSize="11" fontWeight="700">3. Kalibrasi Simplex</text>
          <line x1="14" y1="32" x2="136" y2="32" stroke="var(--border-subtle)" />
          <text x="14" y="52" fill="var(--text-secondary)" fontSize="10">Target: DIobs (SM)</text>
          <text x="14" y="74" fill="var(--color-moss)" fontSize="10" fontFamily="var(--font-mono)">Minimasi MSE</text>
          <text x="14" y="96" fill="var(--text-muted)" fontSize="9.5">Parameter fit:</text>
          <text x="14" y="114" fill="var(--text-primary)" fontSize="10" fontFamily="var(--font-mono)">[aH, bH, n, α]</text>
          <text x="14" y="138" fill="var(--text-muted)" fontSize="9">Nelder-Mead (1965)</text>
        </g>

        {/* Panah 3 -> 4 */}
        <line x1="586" y1="102" x2="618" y2="102" stroke="var(--color-moss)" strokeWidth="2" markerEnd="url(#arrow)" />

        {/* 4. Kotak Output PFVI & Kategori Risiko */}
        <g
          transform="translate(624, 25)"
          onClick={() => setActiveStage('risk')}
          style={{ cursor: 'pointer' }}
          opacity={activeStage === 'risk' ? 1 : 0.75}
        >
          <rect
            x="0" y="0" width="122" height="155" rx="8"
            fill="var(--bg-card)"
            stroke={activeStage === 'risk' ? 'var(--color-moss)' : 'var(--border-medium)'}
            strokeWidth={activeStage === 'risk' ? '2' : '1'}
          />
          <text x="10" y="24" fill="var(--text-primary)" fontSize="11" fontWeight="700">4. Indeks PFVI</text>
          <line x1="10" y1="32" x2="112" y2="32" stroke="var(--border-subtle)" />
          <rect x="10" y="44" width="102" height="18" rx="3" fill="var(--risk-low-bg)" />
          <text x="14" y="57" fill="#22c55e" fontSize="9" fontWeight="700">0-75: Rendah</text>

          <rect x="10" y="68" width="102" height="18" rx="3" fill="var(--risk-mod-bg)" />
          <text x="14" y="81" fill="#eab308" fontSize="9" fontWeight="700">76-150: Sedang</text>

          <rect x="10" y="92" width="102" height="18" rx="3" fill="var(--risk-high-bg)" />
          <text x="14" y="105" fill="#f97316" fontSize="9" fontWeight="700">151-225: Tinggi</text>

          <rect x="10" y="116" width="102" height="18" rx="3" fill="var(--risk-extreme-bg)" />
          <text x="14" y="129" fill="#ef4444" fontSize="9" fontWeight="700">226-300: Ekstrem</text>

          <text x="10" y="148" fill="var(--text-muted)" fontSize="8.5">Peringatan Dini</text>
        </g>
      </svg>

      {/* Keterangan Tahap Aktif */}
      <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-moss)' }}>
          {stageData[activeStage].title}
        </h4>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {stageData[activeStage].content}
        </p>
      </div>
    </div>
  );
}
