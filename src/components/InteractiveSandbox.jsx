import React, { useState, useMemo } from 'react';
import PeatlandCrossSectionSVG from './PeatlandCrossSectionSVG';
import PFVIGaugeSVG from './PFVIGaugeSVG';
import {
  calculateDIObs,
  calculateDF,
  calculateRF,
  calculateWTF,
  simulatePFVI,
  getPFVIRiskCategory
} from '../utils/peatfrMath';

/**
 * InteractiveSandbox
 * Simulator Hidrologi & Kalkulator Peat Fire Vulnerability Index (PFVI)
 * Terhubung langsung dengan visualisasi penampang tanah gambut SVG dan gauge risiko
 */
export default function InteractiveSandbox() {
  // Parameter Sensor Interaktif
  const [waterTable, setWaterTable] = useState(-0.55); // meter
  const [soilMoisture, setSoilMoisture] = useState(42); // %
  const [rainfall, setRainfall] = useState(0); // mm
  const [temperature, setTemperature] = useState(33.5); // °C
  const [r0, setR0] = useState(2800); // mm/tahun
  const [dt] = useState(1); // hari
  const [forecastHorizon, setForecastHorizon] = useState(4); // hari

  // Preset Kondisi Lapangan
  const applyPreset = (preset) => {
    switch (preset) {
      case 'wet':
        setWaterTable(-0.18);
        setSoilMoisture(68);
        setRainfall(16);
        setTemperature(28.5);
        break;
      case 'threshold':
        setWaterTable(-0.40);
        setSoilMoisture(46);
        setRainfall(2.5);
        setTemperature(32.0);
        break;
      case 'dry':
        setWaterTable(-0.85);
        setSoilMoisture(31);
        setRainfall(0);
        setTemperature(35.5);
        break;
      case 'extreme':
        setWaterTable(-1.35);
        setSoilMoisture(21);
        setRainfall(0);
        setTemperature(38.8);
        break;
      default:
        break;
    }
  };

  // Kalkulasi Matematis Instan
  const metrics = useMemo(() => {
    const diObs = calculateDIObs(soilMoisture);
    const df = calculateDF(diObs, temperature, r0, dt);
    const rf = calculateRF(rainfall, 0);
    const hDepth = waterTable > 0 ? 0 : -waterTable;
    const wtf = calculateWTF(0.25, 0.18, 1.45, hDepth, 0.35);
    const rawPfvi = diObs + df - rf - wtf;
    const currentPfvi = Math.max(0, Math.min(300, rawPfvi));
    const risk = getPFVIRiskCategory(currentPfvi);

    // Buat runtun waktu 14 hari sintetis berdasarkan parameter saat ini untuk visualisasi tren
    const timeSteps = 14;
    const wtSeries = [];
    const smSeries = [];
    const rfSeries = [];
    const tempSeries = [];

    for (let i = 0; i < timeSteps; i++) {
      const stepProg = i / (timeSteps - 1);
      // Variasi dinamis menuju kondisi saat ini
      const wtVal = waterTable + (Math.sin(i * 0.7) * 0.08) - (0.05 * (1 - stepProg));
      const smVal = soilMoisture + (Math.cos(i * 0.8) * 3) + (2 * (1 - stepProg));
      const rfVal = i === 3 ? rainfall + 5 : (i === 8 ? rainfall + 2 : rainfall);
      const tempVal = temperature + (Math.sin(i * 0.5) * 1.5);

      wtSeries.push(wtVal);
      smSeries.push(smVal);
      rfSeries.push(rfVal);
      tempSeries.push(tempVal);
    }

    const sim = simulatePFVI(wtSeries, smSeries, rfSeries, tempSeries, [0.25, 0.18, 1.45, 0.35], r0, dt);

    return {
      diObs,
      df,
      rf,
      wtf,
      currentPfvi,
      risk,
      simulationSeries: sim.pfvi
    };
  }, [waterTable, soilMoisture, rainfall, temperature, r0, dt]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero Intro Sandbox */}
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-pill">
              <span>Sistem Deteksi Dini Kebakaran Gambut</span>
            </span>
            <h1 className="hero-title">
              Simulasi Hidrologi & Kerentanan Api Gambut
            </h1>
            <p className="hero-desc">
              Kendalikan parameter muka air tanah, kelembaban, curah hujan, dan suhu untuk mengamati respons hidrologi penampang tanah gambut secara langsung berdasarkan formulasi stokastik paket R peatfr.
            </p>

            {/* Tombol Preset Cepat */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>
                Preset Lapangan:
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 12px', minHeight: '38px', fontSize: '0.82rem' }}
                onClick={() => applyPreset('wet')}
              >
                Gambut Basah
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 12px', minHeight: '38px', fontSize: '0.82rem' }}
                onClick={() => applyPreset('threshold')}
              >
                Batas PP 57/2016 (-0.4m)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 12px', minHeight: '38px', fontSize: '0.82rem' }}
                onClick={() => applyPreset('dry')}
              >
                Kemarau Rawan
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 12px', minHeight: '38px', fontSize: '0.82rem' }}
                onClick={() => applyPreset('extreme')}
              >
                El Niño Ekstrem
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="hero-stats-row">
            <div className="stat-box">
              <div className="stat-label">Muka Air Tanah</div>
              <div className="stat-value" style={{ color: 'var(--color-water)' }}>
                {waterTable.toFixed(2)}
                <span className="stat-unit">m</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Kelembaban</div>
              <div className="stat-value" style={{ color: '#10b981' }}>
                {soilMoisture.toFixed(1)}
                <span className="stat-unit">%</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Curah Hujan</div>
              <div className="stat-value" style={{ color: '#38bdf8' }}>
                {rainfall.toFixed(1)}
                <span className="stat-unit">mm</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Suhu Udara</div>
              <div className="stat-value" style={{ color: '#f59e0b' }}>
                {temperature.toFixed(1)}
                <span className="stat-unit">°C</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Utama: Kontrol Slider vs Gauge & Penampang SVG */}
      <div className="grid-2">
        {/* Kolom Kiri: Panel Pengaturan Parameter */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Panel Kontrol Sensor Lingkungan</h2>
            <p className="card-subtitle">
              Geser nilai parameter untuk mensimulasikan dinamika lahan gambut
            </p>
          </div>

          {/* Slider 1: Muka Air Tanah (WT) */}
          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="wt-slider" className="control-label">
                Kedalaman Muka Air Tanah (WT)
              </label>
              <span className="control-val-badge" style={{ color: 'var(--color-water)' }}>
                {waterTable.toFixed(2)} meter ({Math.round(Math.abs(waterTable) * 100)} cm)
              </span>
            </div>
            <input
              id="wt-slider"
              type="range"
              min="-1.50"
              max="0.00"
              step="0.01"
              value={waterTable}
              onChange={(e) => setWaterTable(parseFloat(e.target.value))}
              className="range-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>-1.50 m (Sangat Surut)</span>
              <span style={{ color: 'var(--risk-high)', fontWeight: 600 }}>-0.40 m (Batas Regulasi)</span>
              <span>0.00 m (Muka Tanah)</span>
            </div>
          </div>

          {/* Slider 2: Kelembaban Tanah (SM) */}
          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="sm-slider" className="control-label">
                Kelembaban Tanah Volumetrik (SM)
              </label>
              <span className="control-val-badge" style={{ color: '#10b981' }}>
                {soilMoisture.toFixed(1)} %
              </span>
            </div>
            <input
              id="sm-slider"
              type="range"
              min="15.0"
              max="85.0"
              step="0.5"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(parseFloat(e.target.value))}
              className="range-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>15% (Kering Parah)</span>
              <span>40% (Kapasitas Lapang)</span>
              <span>70% (Jenuh Air)</span>
            </div>
          </div>

          {/* Slider 3: Curah Hujan (Rf) */}
          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="rf-slider" className="control-label">
                Curah Hujan Harian (Rf)
              </label>
              <span className="control-val-badge" style={{ color: '#38bdf8' }}>
                {rainfall.toFixed(1)} mm/hari
              </span>
            </div>
            <input
              id="rf-slider"
              type="range"
              min="0.0"
              max="50.0"
              step="0.5"
              value={rainfall}
              onChange={(e) => setRainfall(parseFloat(e.target.value))}
              className="range-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>0 mm (Kering)</span>
              <span>5.1 mm (Ambang Efektif)</span>
              <span>50 mm (Hujan Lebat)</span>
            </div>
          </div>

          {/* Slider 4: Suhu Udara (Temp) */}
          <div className="control-group">
            <div className="control-label-row">
              <label htmlFor="temp-slider" className="control-label">
                Suhu Udara (Temp)
              </label>
              <span className="control-val-badge" style={{ color: '#f59e0b' }}>
                {temperature.toFixed(1)} °C
              </span>
            </div>
            <input
              id="temp-slider"
              type="range"
              min="24.0"
              max="42.0"
              step="0.5"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="range-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>24°C (Sejuk)</span>
              <span>32°C (Hangat Normal)</span>
              <span>42°C (Panas Terik)</span>
            </div>
          </div>

          {/* Slider 5: Curah Hujan Tahunan R0 & Horizon h */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div className="control-group" style={{ marginBottom: 0 }}>
              <div className="control-label-row">
                <label htmlFor="r0-slider" className="control-label" style={{ fontSize: '0.8rem' }}>
                  R0 Hujan Tahunan
                </label>
                <span className="control-val-badge" style={{ fontSize: '0.75rem' }}>
                  {r0} mm
                </span>
              </div>
              <input
                id="r0-slider"
                type="range"
                min="2000"
                max="4000"
                step="50"
                value={r0}
                onChange={(e) => setR0(parseInt(e.target.value, 10))}
                className="range-slider"
              />
            </div>

            <div className="control-group" style={{ marginBottom: 0 }}>
              <div className="control-label-row">
                <label htmlFor="h-select" className="control-label" style={{ fontSize: '0.8rem' }}>
                  Horizon Prediksi (h)
                </label>
              </div>
              <select
                id="h-select"
                value={forecastHorizon}
                onChange={(e) => setForecastHorizon(parseInt(e.target.value, 10))}
                className="input-select"
                style={{ minHeight: '38px', padding: '4px 8px' }}
              >
                <option value={3}>3 Hari ke Depan</option>
                <option value={4}>4 Hari (Standar peatfr)</option>
                <option value={7}>7 Hari (1 Pekan)</option>
                <option value={14}>14 Hari (2 Pekan)</option>
              </select>
            </div>
          </div>

          {/* Rincian Komponen Formula Neraca Hidrologi */}
          <div style={{
            marginTop: '1.25rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Dekomposisi Komponen Formula Hidrologi:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>DI_obs: </span>
                <strong>{metrics.diObs.toFixed(2)}</strong>
              </div>
              <div>
                <span style={{ color: '#eab308' }}>DF (Kekeringan): </span>
                <strong>+{metrics.df.toFixed(2)}</strong>
              </div>
              <div>
                <span style={{ color: '#0ea5e9' }}>RF (Reduksi Hujan): </span>
                <strong>-{metrics.rf.toFixed(2)}</strong>
              </div>
              <div>
                <span style={{ color: '#f97316' }}>WTF (Hisap Gambut): </span>
                <strong>-{metrics.wtf.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Speedometer Gauge PFVI */}
        <div>
          <PFVIGaugeSVG pfviValue={metrics.currentPfvi} />
        </div>
      </div>

      {/* Ilustrasi Penampang Gambut Interaktif Penuh */}
      <PeatlandCrossSectionSVG
        waterTable={waterTable}
        soilMoisture={soilMoisture}
        temperature={temperature}
        rainfall={rainfall}
      />

      {/* Visualisasi Kurva Waktu Runtun SVG */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 className="card-title">Simulasi Fluktuasi Runtun Waktu 14 Hari</h3>
            <p className="card-subtitle">
              Respon indeks kerentanan PFVI terhadap dinamika fluktuasi air tanah dan cuaca
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-moss)' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: 'var(--color-moss)', borderRadius: '2px' }} />
              PFVI Terhitung
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--risk-high)' }}>
              <span style={{ width: '12px', height: '2px', backgroundColor: 'var(--risk-high)', borderRadius: '2px', borderTop: '1px dashed' }} />
              Ambang Kritis 150
            </span>
          </div>
        </div>

        <svg
          viewBox="0 0 720 180"
          className="svg-responsive-container"
          style={{ width: '100%', height: 'auto', background: 'var(--bg-surface)', borderRadius: '8px' }}
          aria-label="Kurva Runtun Waktu Simulasi PFVI"
        >
          {/* Garis Grid Y */}
          <line x1="40" y1="30" x2="700" y2="30" stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <text x="25" y="34" fill="var(--text-muted)" fontSize="9">300</text>

          <line x1="40" y1="80" x2="700" y2="80" stroke="rgba(249, 115, 22, 0.4)" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x="25" y="84" fill="var(--risk-high)" fontSize="9">150</text>

          <line x1="40" y1="130" x2="700" y2="130" stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <text x="25" y="134" fill="var(--text-muted)" fontSize="9">75</text>

          <line x1="40" y1="160" x2="700" y2="160" stroke="var(--border-subtle)" />
          <text x="30" y="164" fill="var(--text-muted)" fontSize="9">0</text>

          {/* Area / Path Kurva PFVI */}
          {metrics.simulationSeries && metrics.simulationSeries.length > 0 && (() => {
            const n = metrics.simulationSeries.length;
            const stepX = (700 - 50) / (n - 1);
            const points = metrics.simulationSeries.map((val, idx) => {
              const x = 50 + idx * stepX;
              // Y scale: 0 = 160, 300 = 30
              const y = 160 - (val / 300) * 130;
              return { x, y, val };
            });

            const pathD = points.reduce((acc, p, idx) => (
              idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
            ), '');

            return (
              <g>
                <path d={pathD} fill="none" stroke="var(--color-moss)" strokeWidth="3" />
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={idx === n - 1 ? 5 : 3}
                    fill={idx === n - 1 ? 'var(--color-moss)' : 'var(--bg-card)'}
                    stroke="var(--color-moss)"
                    strokeWidth="2"
                  >
                    <title>Hari ke-{idx + 1}: PFVI = {p.val.toFixed(1)}</title>
                  </circle>
                ))}
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
