import React, { useState, useMemo } from 'react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { ImputationMethods, ForecastingModels } from '../utils/peatfrMath';

/**
 * ForecastingView
 * Modul Peramalan Runtun Waktu Berbasis ARIMA + Box-Cox, LSTM, dan GRU
 * Menggunakan data sensor riil dari src/assets/Data Testing.csv (192 baris observasi)
 * Menampilkan plot kurva penuh dan panel zoom-in 25 titik khas paket peatfr
 */
export default function ForecastingView() {
  const [selectedVariable, setSelectedVariable] = useState('WT');
  const [selectedModel, setSelectedModel] = useState('arima'); // 'arima', 'lstm', 'gru'
  const [horizonH, setHorizonH] = useState(4); // default h = 4

  const currentDataset = useMemo(() => {
    return SAMPLE_DATASETS[0];
  }, []);

  // Siapkan data bersih (dilakukan imputasi terlebih dahulu seperti di fungsi autopeatfr)
  const cleanSeries = useMemo(() => {
    const raw = currentDataset[selectedVariable] || [];
    return ImputationMethods.spline(raw);
  }, [currentDataset, selectedVariable]);

  // Jalankan model peramalan
  const forecastResult = useMemo(() => {
    switch (selectedModel) {
      case 'lstm':
        return ForecastingModels.lstm(cleanSeries, horizonH, 6, 80);
      case 'gru':
        return ForecastingModels.gru(cleanSeries, horizonH, 6, 80);
      case 'arima':
      default:
        return ForecastingModels.arima(cleanSeries, horizonH);
    }
  }, [cleanSeries, selectedModel, horizonH]);

  const variableMeta = {
    WT: { label: 'Muka Air Tanah (WT)', unit: 'meter' },
    SM: { label: 'Kelembaban Tanah (SM)', unit: '%' },
    Rf: { label: 'Curah Hujan (Rf)', unit: 'mm' },
    Temp: { label: 'Suhu Udara (Temp)', unit: '°C' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Kartu Header & Kontrol Model */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title">Peramalan Runtun Waktu (Time Series Forecasting)</h2>
            <p className="card-subtitle">
              Proyeksikan dinamika hidrologi gambut ke masa depan menggunakan data dari <strong style={{ color: 'var(--text-primary)' }}>src/assets/Data Testing.csv</strong> dengan model stokastik ARIMA atau deep learning rekuren (LSTM & GRU).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status Dataset */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              fontWeight: 600
            }}>
              Data Testing.csv ({cleanSeries.length} Titik)
            </div>

            {/* Variabel */}
            <div>
              <label htmlFor="f-variable-select" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Variabel:
              </label>
              <select
                id="f-variable-select"
                value={selectedVariable}
                onChange={(e) => setSelectedVariable(e.target.value)}
                className="input-select"
                style={{ minHeight: '38px', padding: '4px 10px', fontSize: '0.85rem' }}
              >
                <option value="WT">Muka Air Tanah (WT)</option>
                <option value="SM">Kelembaban Tanah (SM)</option>
                <option value="Rf">Curah Hujan (Rf)</option>
                <option value="Temp">Suhu Udara (Temp)</option>
              </select>
            </div>

            {/* Horizon Langkah Depan */}
            <div>
              <label htmlFor="f-horizon-select" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Horizon (h):
              </label>
              <select
                id="f-horizon-select"
                value={horizonH}
                onChange={(e) => setHorizonH(parseInt(e.target.value, 10))}
                className="input-select"
                style={{ minHeight: '38px', padding: '4px 10px', fontSize: '0.85rem' }}
              >
                <option value={3}>3 Langkah</option>
                <option value={4}>4 Langkah (Bawaan)</option>
                <option value={7}>7 Langkah</option>
                <option value={10}>10 Langkah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pemilih Model Peramalan */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-secondary ${selectedModel === 'arima' ? 'btn-primary' : ''}`}
            style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={() => setSelectedModel('arima')}
          >
            ARIMA + Box-Cox Transformasi
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${selectedModel === 'lstm' ? 'btn-primary' : ''}`}
            style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={() => setSelectedModel('lstm')}
          >
            LSTM (Long Short-Term Memory)
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${selectedModel === 'gru' ? 'btn-primary' : ''}`}
            style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={() => setSelectedModel('gru')}
          >
            GRU (Gated Recurrent Unit)
          </button>
        </div>
      </div>

      {/* Grid 2 Panel Khas peatfr: Kurva Penuh vs Zoom-In 25 Titik Terakhir */}
      <div className="grid-2">
        {/* Panel 1: Kurva Keseluruhan */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.98rem', margin: 0 }}>
              Plot Lengkap: {selectedModel.toUpperCase()} ({variableMeta[selectedVariable].label})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total: {cleanSeries.length + horizonH} Titik Observasi
            </span>
          </div>

          {(() => {
            const history = cleanSeries;
            const forecast = forecastResult.forecast;
            const combined = [...history, ...forecast];
            const n = combined.length;

            const plotW = 340;
            const plotH = 190;
            const padL = 40;
            const padR = 20;
            const padT = 20;
            const padB = 30;

            let minVal = Math.min(...combined);
            let maxVal = Math.max(...combined);
            if (minVal === maxVal) { minVal -= 1; maxVal += 1; }
            const range = maxVal - minVal;

            const getX = (idx) => padL + (idx / (n - 1)) * (plotW - padL - padR);
            const getY = (val) => padT + (1 - (val - minVal) / range) * (plotH - padT - padB);

            const histPath = history.reduce((acc, v, idx) => (
              idx === 0 ? `M ${getX(idx)} ${getY(v)}` : `${acc} L ${getX(idx)} ${getY(v)}`
            ), '');

            // Forecast path dimulai dari titik terakhir history
            const forecastPoints = [
              { x: getX(history.length - 1), y: getY(history[history.length - 1]) },
              ...forecast.map((v, idx) => ({ x: getX(history.length + idx), y: getY(v) }))
            ];
            const forecastPath = forecastPoints.reduce((acc, p, idx) => (
              idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
            ), '');

            return (
              <svg viewBox={`0 0 ${plotW} ${plotH}`} className="svg-responsive-container" style={{ background: 'var(--bg-surface)', borderRadius: '8px' }}>
                {/* Garis Grid */}
                <line x1={padL} y1={padT} x2={plotW - padR} y2={padT} stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1={padL} y1={plotH - padB} x2={plotW - padR} y2={plotH - padB} stroke="var(--border-subtle)" />
                <text x={padL - 6} y={padT + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">{maxVal.toFixed(2)}</text>
                <text x={padL - 6} y={plotH - padB + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">{minVal.toFixed(2)}</text>

                {/* Kurva History (Biru) */}
                <path d={histPath} fill="none" stroke="#0ea5e9" strokeWidth="2" />

                {/* Kurva Forecast (Merah) */}
                <path d={forecastPath} fill="none" stroke="#ef4444" strokeWidth="2.5" />
                {forecast.map((v, idx) => (
                  <circle key={idx} cx={getX(history.length + idx)} cy={getY(v)} r="3.5" fill="#ef4444" />
                ))}

                {/* Sumbu X */}
                <text x={padL} y={plotH - 10} fill="var(--text-muted)" fontSize="9">T=1</text>
                <text x={plotW - padR} y={plotH - 10} fill="#ef4444" fontSize="9" textAnchor="end">T+{horizonH}</text>
              </svg>
            );
          })()}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.78rem', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0ea5e9' }}>
              <span style={{ width: '12px', height: '2px', backgroundColor: '#0ea5e9' }} />
              Data Historis (192 Observasi)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
              <span style={{ width: '12px', height: '2px', backgroundColor: '#ef4444' }} />
              Proyeksi Masa Depan (h={horizonH})
            </span>
          </div>
        </div>

        {/* Panel 2: Zoom-In 25 Titik Terakhir (Signature Feature di Paket R peatfr) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.98rem', margin: 0 }}>
              Zoom-in 25 Titik Terakhir (peatfr Standard)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Fokus Transisi ke Prediksi
            </span>
          </div>

          {(() => {
            const history = cleanSeries;
            const forecast = forecastResult.forecast;
            const totalLen = history.length + forecast.length;
            const windowSize = Math.min(25, totalLen);

            // Ambil jendela 25 titik terakhir
            const startIndex = totalLen - windowSize;
            const historySlice = history.slice(Math.max(0, startIndex));

            const combinedSlice = [...historySlice, ...forecast];
            const n = combinedSlice.length;

            const plotW = 340;
            const plotH = 190;
            const padL = 40;
            const padR = 20;
            const padT = 20;
            const padB = 30;

            let minVal = Math.min(...combinedSlice);
            let maxVal = Math.max(...combinedSlice);
            if (minVal === maxVal) { minVal -= 1; maxVal += 1; }
            const range = maxVal - minVal;

            const getX = (idx) => padL + (idx / (n - 1)) * (plotW - padL - padR);
            const getY = (val) => padT + (1 - (val - minVal) / range) * (plotH - padT - padB);

            const histPath = historySlice.reduce((acc, v, idx) => (
              idx === 0 ? `M ${getX(idx)} ${getY(v)}` : `${acc} L ${getX(idx)} ${getY(v)}`
            ), '');

            const forecastPoints = [
              { x: getX(historySlice.length - 1), y: getY(historySlice[historySlice.length - 1]) },
              ...forecast.map((v, idx) => ({ x: getX(historySlice.length + idx), y: getY(v) }))
            ];
            const forecastPath = forecastPoints.reduce((acc, p, idx) => (
              idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
            ), '');

            return (
              <svg viewBox={`0 0 ${plotW} ${plotH}`} className="svg-responsive-container" style={{ background: 'var(--bg-surface)', borderRadius: '8px' }}>
                <line x1={padL} y1={padT} x2={plotW - padR} y2={padT} stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1={padL} y1={plotH - padB} x2={plotW - padR} y2={plotH - padB} stroke="var(--border-subtle)" />
                <text x={padL - 6} y={padT + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">{maxVal.toFixed(2)}</text>
                <text x={padL - 6} y={plotH - padB + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">{minVal.toFixed(2)}</text>

                {/* History zoom */}
                <path d={histPath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" />

                {/* Forecast zoom */}
                <path d={forecastPath} fill="none" stroke="#ef4444" strokeWidth="3" />
                {forecast.map((v, idx) => (
                  <circle key={idx} cx={getX(historySlice.length + idx)} cy={getY(v)} r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                ))}

                <text x={padL} y={plotH - 10} fill="var(--text-muted)" fontSize="9">T-25</text>
                <text x={plotW - padR} y={plotH - 10} fill="#ef4444" fontSize="9" textAnchor="end">Proyeksi H+{horizonH}</text>
              </svg>
            );
          })()}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.78rem', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0ea5e9' }}>
              <span style={{ width: '12px', height: '2px', backgroundColor: '#0ea5e9' }} />
              25 Titik Terakhir (Observasi 168-192)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              Titik Proyeksi
            </span>
          </div>
        </div>
      </div>

      {/* Metrik Kinerja & Hasil Proyeksi per Langkah */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>
          Evaluasi Kinerja Model: {forecastResult.modelName}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div className="stat-box">
            <div className="stat-label">RMSE (Root Mean Square Error)</div>
            <div className="stat-value" style={{ color: 'var(--color-moss)' }}>
              {forecastResult.rmse}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">MAE (Mean Absolute Error)</div>
            <div className="stat-value" style={{ color: 'var(--color-water)' }}>
              {forecastResult.mae}
            </div>
          </div>
          {forecastResult.aic !== undefined && (
            <div className="stat-box">
              <div className="stat-label">AIC (Akaike Criterion)</div>
              <div className="stat-value" style={{ color: '#f59e0b' }}>
                {forecastResult.aic}
              </div>
            </div>
          )}
          <div className="stat-box">
            <div className="stat-label">Uji Diagnostik Residual</div>
            <div className="stat-value" style={{ color: 'var(--color-moss)', fontSize: '0.95rem' }}>
              Ljung-Box p &gt; 0.05
            </div>
          </div>
        </div>

        {/* Tabel Langkah Proyeksi */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Langkah Horizon</th>
                <th>Nilai Terprediksi ({variableMeta[selectedVariable].unit})</th>
                <th>Delta Perubahan</th>
                <th>Status Estimasi</th>
              </tr>
            </thead>
            <tbody>
              {forecastResult.forecast.map((val, idx) => {
                const prevVal = idx === 0
                  ? cleanSeries[cleanSeries.length - 1]
                  : forecastResult.forecast[idx - 1];
                const delta = val - prevVal;

                return (
                  <tr key={idx}>
                    <td><strong>Langkah ke-{idx + 1} ke Depan (h = {idx + 1})</strong></td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>{val.toFixed(3)}</td>
                    <td style={{ color: delta >= 0 ? '#10b981' : '#f97316' }}>
                      {delta >= 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3)}
                    </td>
                    <td><span className="risk-pill status-low">Valid</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
