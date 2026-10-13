import React from 'react';
import { getPFVIRiskCategory } from '../utils/peatfrMath';

/**
 * PFVIGaugeSVG
 * Speedometer / Arc Gauge Meter SVG Interaktif untuk Peat Fire Vulnerability Index (PFVI 0 - 300)
 */
export default function PFVIGaugeSVG({ pfviValue = 118 }) {
  const safeValue = Math.max(0, Math.min(300, Number(pfviValue) || 0));
  const category = getPFVIRiskCategory(safeValue);

  // Sudut busur gauge: -180 derajat (kiri, nilai 0) s/d 0 derajat (kanan, nilai 300)
  // Rentang 180 derajat untuk nilai 0 s/d 300
  // Sudut = -180 + (val / 300) * 180
  const angleDeg = -180 + (safeValue / 300) * 180;
  // Sudut rotasi jarum relatif terhadap posisi default vertikal (12 o'clock):
  // Nilai 0   -> angleDeg = -180 -> rotation = -90° (horizontal kiri)
  // Nilai 150 -> angleDeg = -90  -> rotation = 0°   (vertikal atas)
  // Nilai 300 -> angleDeg = 0    -> rotation = +90° (horizontal kanan)
  const needleRotation = angleDeg + 90;

  // Koordinat poros tengah & panjang jarum
  const centerX = 160;
  const centerY = 150;
  const needleLength = 95;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          Indeks Kerentanan (PFVI)
        </span>
        <span className={`risk-pill ${category.statusClass}`}>
          {category.level}
        </span>
      </div>

      <svg
        viewBox="0 0 320 200"
        style={{ width: '100%', maxWidth: '280px', height: 'auto', margin: '0.5rem 0' }}
        aria-label={`Gauge Indeks Kerentanan Gambut ${safeValue.toFixed(1)}`}
      >
        <defs>
          {/* Filter bayangan menggunakan filterUnits="userSpaceOnUse" agar tidak kolaps saat jarum horizontal (nilai 0 / 300) */}
          <filter id="gaugeShadow" x="-20" y="-20" width="360" height="240" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Busur Latar Belakang */}
        <path
          d="M 30 150 A 130 130 0 0 1 290 150"
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="22"
          strokeLinecap="round"
        />

        {/* 4 Zona Busur Risiko:
            Total 180 derajat = 4 x 45 derajat
            Zona 1: Rendah (0-75) -> -180° s/d -135°
            Zona 2: Sedang (76-150) -> -135° s/d -90°
            Zona 3: Tinggi (151-225) -> -90° s/d -45°
            Zona 4: Ekstrem (226-300) -> -45° s/d 0°
        */}
        {/* Zona 1: Rendah (Hijau) */}
        <path
          d="M 30 150 A 130 130 0 0 1 68.1 58.1"
          fill="none"
          stroke="#22c55e"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Zona 2: Sedang (Kuning) */}
        <path
          d="M 68.1 58.1 A 130 130 0 0 1 160 20"
          fill="none"
          stroke="#eab308"
          strokeWidth="20"
          opacity="0.9"
        />

        {/* Zona 3: Tinggi (Oranye) */}
        <path
          d="M 160 20 A 130 130 0 0 1 251.9 58.1"
          fill="none"
          stroke="#f97316"
          strokeWidth="20"
          opacity="0.9"
        />

        {/* Zona 4: Ekstrem (Merah) */}
        <path
          d="M 251.9 58.1 A 130 130 0 0 1 290 150"
          fill="none"
          stroke="#ef4444"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Label Angka Skala */}
        <text x="35" y="172" fill="var(--text-muted)" fontSize="11" fontWeight="600" textAnchor="middle">0</text>
        <text x="75" y="48" fill="var(--text-muted)" fontSize="10" fontWeight="600" textAnchor="middle">75</text>
        <text x="160" y="14" fill="var(--text-muted)" fontSize="10" fontWeight="600" textAnchor="middle">150</text>
        <text x="245" y="48" fill="var(--text-muted)" fontSize="10" fontWeight="600" textAnchor="middle">225</text>
        <text x="285" y="172" fill="var(--text-muted)" fontSize="11" fontWeight="600" textAnchor="middle">300</text>

        {/* Jarum Penunjuk Gauge */}
        <g
          transform={`rotate(${needleRotation} ${centerX} ${centerY})`}
          style={{
            transform: `rotate(${needleRotation}deg)`,
            transformOrigin: `${centerX}px ${centerY}px`,
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Jarum presisi 2D tapered dengan rounded tip agar selalu memiliki bounding box positif */}
          <path
            d={`M ${centerX - 2.5} ${centerY} L ${centerX - 1} ${centerY - needleLength} Q ${centerX} ${centerY - needleLength - 2} ${centerX + 1} ${centerY - needleLength} L ${centerX + 2.5} ${centerY} Z`}
            fill="var(--text-primary)"
            filter="url(#gaugeShadow)"
          />
        </g>
        
        {/* Titik Poros Tengah */}
        <circle cx={centerX} cy={centerY} r="10" fill="var(--text-primary)" />
        <circle cx={centerX} cy={centerY} r="5" fill={category.color} />
      </svg>

      {/* Tampilan Nilai Numerik */}
      <div style={{ marginTop: '-0.75rem', marginBottom: '0.75rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '2.4rem',
          fontWeight: '800',
          color: category.color,
          lineHeight: 1
        }}>
          {safeValue.toFixed(1)}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Rentang Standar: 0 s/d 300
        </div>
      </div>

      {/* Deskripsi & Rekomendasi Lapangan */}
      <div style={{
        padding: '0.75rem',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        width: '100%',
        textAlign: 'left'
      }}>
        <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {category.description}
        </p>
        <div style={{
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px dashed var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)'
        }}>
          <strong style={{ color: category.color }}>Tindakan: </strong>
          {category.recommendation}
        </div>
      </div>
    </div>
  );
}
