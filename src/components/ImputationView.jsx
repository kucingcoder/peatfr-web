import React, { useState, useMemo } from 'react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { ImputationMethods } from '../utils/peatfrMath';

/**
 * ImputationView
 * Modul Evaluasi & Visualisasi 4 Metode Imputasi Data Hilang (NA)
 * Berdasarkan paket peatfr: k-NN, Spline, Linear, LOESS
 * Menggunakan data sensor riil dari src/assets/Data Testing.csv (192 baris observasi)
 * dengan fitur simulasi celah sensor (gap benchmarking) terhadap ground truth asli.
 */
export default function ImputationView() {
  const [selectedVariable, setSelectedVariable] = useState('WT');
  const [activeMethod, setActiveMethod] = useState('knn'); // 'knn', 'spline', 'linear', 'loess', 'all'
  const [missingRate, setMissingRate] = useState('10'); // '0', '5', '10', '15', 'block'

  const currentDataset = useMemo(() => {
    return SAMPLE_DATASETS[0];
  }, []);

  const variableMeta = {
    WT: { label: 'Muka Air Tanah (WT)', unit: 'meter', color: '#0ea5e9' },
    SM: { label: 'Kelembaban Tanah (SM)', unit: '%', color: '#10b981' },
    Rf: { label: 'Curah Hujan (Rf)', unit: 'mm', color: '#38bdf8' },
    Temp: { label: 'Suhu Udara (Temp)', unit: '°C', color: '#f59e0b' }
  };

  const methodColors = {
    knn: '#8b5cf6',
    spline: '#06b6d4',
    linear: '#f97316',
    loess: '#ec4899'
  };

  // Ekstrak data asli dari Data Testing.csv
  const groundTruthSeries = useMemo(() => {
    return currentDataset[selectedVariable] || [];
  }, [currentDataset, selectedVariable]);

  // Bangun deret uji dengan celah simulasi (jika dipilih) atau data riil
  const rawSeries = useMemo(() => {
    if (!groundTruthSeries || groundTruthSeries.length === 0) return [];
    if (missingRate === '0') return [...groundTruthSeries];

    const copy = [...groundTruthSeries];
    const n = copy.length;

    if (missingRate === 'block') {
      // Skenario sensor outage: 15 titik berurutan putus (titik 80 - 94)
      for (let i = 80; i < Math.min(95, n); i++) {
        copy[i] = null;
      }
    } else {
      // Deterministic pseudo-random pattern untuk reproducibility pengujian
      const rateNum = parseInt(missingRate, 10) / 100;
      const targetMissing = Math.round(n * rateNum);
      const step = Math.max(2, Math.floor(n / targetMissing));

      for (let i = 4; i < n - 4; i += step) {
        copy[i] = null;
      }
    }
    return copy;
  }, [groundTruthSeries, missingRate]);

  // Hitung imputasi untuk masing-masing metode
  const imputedResults = useMemo(() => {
    const linear = ImputationMethods.linear(rawSeries);
    const spline = ImputationMethods.spline(rawSeries);
    const knn = ImputationMethods.knn(rawSeries, 5);
    const loess = ImputationMethods.loess(rawSeries, 0.5);

    // Hitung titik kosong
    const missingIndices = [];
    rawSeries.forEach((v, idx) => {
      if (v === null || v === undefined || isNaN(v)) {
        missingIndices.push(idx);
      }
    });

    const missingCount = missingIndices.length;
    const missingPercent = rawSeries.length > 0 ? ((missingCount / rawSeries.length) * 100).toFixed(1) : '0';

    // Hitung akurasi rekonstruksi terhadap ground truth Data Testing.csv
    const calcError = (imputedArr) => {
      if (missingCount === 0) return { mae: '0.000', rmse: '0.000' };
      let sumAbs = 0;
      let sumSq = 0;
      missingIndices.forEach((idx) => {
        const actual = groundTruthSeries[idx];
        const pred = imputedArr[idx];
        const diff = Math.abs(pred - actual);
        sumAbs += diff;
        sumSq += diff * diff;
      });
      return {
        mae: (sumAbs / missingCount).toFixed(4),
        rmse: Math.sqrt(sumSq / missingCount).toFixed(4)
      };
    };

    const calcStats = (arr) => {
      if (arr.length === 0) return { mean: '0', std: '0', min: '0', max: '0' };
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
      return {
        mean: mean.toFixed(2),
        std: Math.sqrt(variance).toFixed(2),
        min: Math.min(...arr).toFixed(2),
        max: Math.max(...arr).toFixed(2)
      };
    };

    return {
      linear,
      spline,
      knn,
      loess,
      missingCount,
      missingPercent,
      stats: {
        linear: calcStats(linear),
        spline: calcStats(spline),
        knn: calcStats(knn),
        loess: calcStats(loess)
      },
      errors: {
        linear: calcError(linear),
        spline: calcError(spline),
        knn: calcError(knn),
        loess: calcError(loess)
      }
    };
  }, [rawSeries, groundTruthSeries]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Kartu Header & Kontrol */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title">Evaluasi Imputasi Sensor Runtun Waktu</h2>
            <p className="card-subtitle">
              Bandingkan 4 algoritma estimasi data hilang paket <strong style={{ color: 'var(--text-primary)' }}>peatfr</strong> pada dataset riil <strong style={{ color: 'var(--text-primary)' }}>src/assets/Data Testing.csv</strong> (192 baris observasi).
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
              Data Testing.csv ({rawSeries.length} Titik)
            </div>

            {/* Pemilih Variabel Sensor */}
            <div>
              <label htmlFor="variable-select" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Variabel Sensor:
              </label>
              <select
                id="variable-select"
                value={selectedVariable}
                onChange={(e) => setSelectedVariable(e.target.value)}
                className="input-select"
                style={{ minHeight: '38px', padding: '4px 10px', fontSize: '0.85rem' }}
              >
                <option value="WT">Muka Air Tanah (WT, m)</option>
                <option value="SM">Kelembaban Tanah (SM, %)</option>
                <option value="Rf">Curah Hujan (Rf, mm)</option>
                <option value="Temp">Suhu Udara (Temp, °C)</option>
              </select>
            </div>

            {/* Simulasi Celah Sensor */}
            <div>
              <label htmlFor="gap-select" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Simulasi Celah Sensor (NA):
              </label>
              <select
                id="gap-select"
                value={missingRate}
                onChange={(e) => setMissingRate(e.target.value)}
                className="input-select"
                style={{ minHeight: '38px', padding: '4px 10px', fontSize: '0.85rem' }}
              >
                <option value="0">Data Utuh (0% Celah)</option>
                <option value="5">Celah 5% (10 data uji)</option>
                <option value="10">Celah 10% (19 data uji - Standar peatfr)</option>
                <option value="15">Celah 15% (29 data uji)</option>
                <option value="block">Outage Sensor (15 titik beruntun)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Pemilih Metode Imputasi */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-secondary ${activeMethod === 'all' ? 'btn-primary' : ''}`}
            style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={() => setActiveMethod('all')}
          >
            Bandingkan Semua Metode
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${activeMethod === 'knn' ? 'btn-primary' : ''}`}
            style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={() => setActiveMethod('knn')}
          >
            k-NN (k = 5)
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${activeMethod === 'spline' ? 'btn-primary' : ''}`}
            style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={() => setActiveMethod('spline')}
          >
            Spline Kubik
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${activeMethod === 'linear' ? 'btn-primary' : ''}`}
            style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={() => setActiveMethod('linear')}
          >
            Interpolasi Linear
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${activeMethod === 'loess' ? 'btn-primary' : ''}`}
            style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={() => setActiveMethod('loess')}
          >
            Regresi LOESS (span 0.5)
          </button>
        </div>
      </div>

      {/* Visualisasi Plot SVG Hasil Imputasi */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
              Plot Sensor: {variableMeta[selectedVariable].label}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              {imputedResults.missingCount > 0
                ? 'Titik merah menandai data sensor kosong (NA) yang diisi kembali oleh algoritma imputasi'
                : 'Menampilkan 192 titik observasi lengkap tanpa data hilang (100% data teramati)'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: imputedResults.missingCount > 0 ? 'var(--risk-high-bg)' : 'var(--color-moss-dim)',
              color: imputedResults.missingCount > 0 ? 'var(--risk-high)' : 'var(--color-moss)',
              fontWeight: 700
            }}>
              {imputedResults.missingCount} Titik Kosong ({imputedResults.missingPercent}%)
            </span>
          </div>
        </div>

        {/* SVG Plot */}
        {(() => {
          const dates = currentDataset.dates;
          const n = dates.length;
          const plotW = 740;
          const plotH = 260;
          const padL = 55;
          const padR = 25;
          const padT = 30;
          const padB = 45;

          // Hitung batas Min dan Max nilai
          const allVals = [
            ...imputedResults.linear,
            ...imputedResults.spline,
            ...imputedResults.knn,
            ...imputedResults.loess
          ].filter(v => !isNaN(v));

          let minVal = Math.min(...allVals);
          let maxVal = Math.max(...allVals);
          if (minVal === maxVal) { minVal -= 1; maxVal += 1; }
          const valRange = maxVal - minVal;

          const getX = (idx) => padL + (idx / (n - 1)) * (plotW - padL - padR);
          const getY = (val) => padT + (1 - (val - minVal) / valRange) * (plotH - padT - padB);

          // Helper untuk path kurva
          const makePath = (series) => {
            return series.reduce((acc, v, idx) => (
              idx === 0 ? `M ${getX(idx)} ${getY(v)}` : `${acc} L ${getX(idx)} ${getY(v)}`
            ), '');
          };

          return (
            <svg
              viewBox={`0 0 ${plotW} ${plotH}`}
              className="svg-responsive-container"
              style={{ width: '100%', height: 'auto', background: 'var(--bg-surface)', borderRadius: '10px' }}
              aria-label="Grafik Imputasi Sensor Gambut"
            >
              {/* Garis Grid Horizontal */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const yVal = minVal + ratio * valRange;
                const yPos = getY(yVal);
                return (
                  <g key={i}>
                    <line x1={padL} y1={yPos} x2={plotW - padR} y2={yPos} stroke="var(--border-subtle)" strokeDasharray="3 3" />
                    <text x={padL - 8} y={yPos + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end" fontFamily="var(--font-mono)">
                      {yVal.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Kurva-Kurva Imputasi */}
              {(activeMethod === 'all' || activeMethod === 'linear') && (
                <path d={makePath(imputedResults.linear)} fill="none" stroke={methodColors.linear} strokeWidth="2" strokeDasharray="4 2" />
              )}
              {(activeMethod === 'all' || activeMethod === 'spline') && (
                <path d={makePath(imputedResults.spline)} fill="none" stroke={methodColors.spline} strokeWidth="2.5" />
              )}
              {(activeMethod === 'all' || activeMethod === 'loess') && (
                <path d={makePath(imputedResults.loess)} fill="none" stroke={methodColors.loess} strokeWidth="2" />
              )}
              {(activeMethod === 'all' || activeMethod === 'knn') && (
                <path d={makePath(imputedResults.knn)} fill="none" stroke={methodColors.knn} strokeWidth="2.5" />
              )}

              {/* Titik Observasi Asli & Titik Hilang */}
              {rawSeries.map((v, idx) => {
                const isMissing = v === null || v === undefined || isNaN(v);
                const xPos = getX(idx);

                if (isMissing) {
                  const chosenVal = activeMethod === 'all' || activeMethod === 'knn'
                    ? imputedResults.knn[idx]
                    : imputedResults[activeMethod][idx];
                  const yPos = getY(chosenVal);

                  return (
                    <g key={idx}>
                      <circle cx={xPos} cy={yPos} r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      <line x1={xPos} y1={yPos - 6} x2={xPos} y2={padT} stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
                    </g>
                  );
                } else {
                  const yPos = getY(v);
                  // Render lingkaran data teramati setiap 2 titik agar tidak terlalu padat
                  if (idx % 2 === 0 || idx === n - 1) {
                    return (
                      <circle key={idx} cx={xPos} cy={yPos} r="2.8" fill="var(--color-moss)" />
                    );
                  }
                  return null;
                }
              })}

              {/* Label Sumbu X */}
              {dates.map((d, idx) => {
                if (idx % 24 === 0 || idx === n - 1) {
                  return (
                    <text
                      key={idx}
                      x={getX(idx)}
                      y={plotH - 12}
                      fill="var(--text-muted)"
                      fontSize="9.5"
                      textAnchor="middle"
                    >
                      {d}
                    </text>
                  );
                }
                return null;
              })}
            </svg>
          );
        })()}

        {/* Legenda Warna Grafik */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem', fontSize: '0.82rem', justifyContent: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-moss)' }} />
            Data Asli Teramati
          </span>
          {imputedResults.missingCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', border: '1px solid #fff' }} />
              Titik Celah Sensor (Diimputasi)
            </span>
          )}
          {(activeMethod === 'all' || activeMethod === 'knn') && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: methodColors.knn }}>
              <span style={{ width: '14px', height: '3px', backgroundColor: methodColors.knn }} />
              k-NN (k = 5)
            </span>
          )}
          {(activeMethod === 'all' || activeMethod === 'spline') && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: methodColors.spline }}>
              <span style={{ width: '14px', height: '3px', backgroundColor: methodColors.spline }} />
              Spline Kubik
            </span>
          )}
          {(activeMethod === 'all' || activeMethod === 'linear') && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: methodColors.linear }}>
              <span style={{ width: '14px', height: '3px', backgroundColor: methodColors.linear, borderTop: '1px dashed' }} />
              Linear
            </span>
          )}
          {(activeMethod === 'all' || activeMethod === 'loess') && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: methodColors.loess }}>
              <span style={{ width: '14px', height: '3px', backgroundColor: methodColors.loess }} />
              LOESS
            </span>
          )}
        </div>
      </div>

      {/* Tabel Evaluasi Statistik & Validasi Akurasi */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            Evaluasi Algoritma Imputasi terhadap Data Testing.csv
          </h3>
          {imputedResults.missingCount > 0 && (
            <span style={{ fontSize: '0.78rem', color: 'var(--color-moss)', fontWeight: 600 }}>
              Divalidasi langsung terhadap ground truth observasi Data Testing.csv
            </span>
          )}
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metode Imputasi</th>
                <th>Paket R Asli</th>
                <th>MAE Error Rekonstruksi</th>
                <th>RMSE Rekonstruksi</th>
                <th>Rerata (Mean)</th>
                <th>Standar Deviasi</th>
                <th>Rentang [Min, Max]</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style={{ color: methodColors.knn }}>k-NN Imputation</strong></td>
                <td>VIM::kNN(k = 5)</td>
                <td style={{ color: 'var(--color-moss)', fontWeight: 700 }}>
                  {imputedResults.errors.knn.mae} {variableMeta[selectedVariable].unit}
                </td>
                <td style={{ color: 'var(--color-moss)', fontWeight: 700 }}>
                  {imputedResults.errors.knn.rmse}
                </td>
                <td>{imputedResults.stats.knn.mean}</td>
                <td>{imputedResults.stats.knn.std}</td>
                <td>[{imputedResults.stats.knn.min}, {imputedResults.stats.knn.max}]</td>
              </tr>
              <tr>
                <td><strong style={{ color: methodColors.spline }}>Spline Interpolation</strong></td>
                <td>zoo::na.spline()</td>
                <td style={{ color: 'var(--color-water)', fontWeight: 700 }}>
                  {imputedResults.errors.spline.mae} {variableMeta[selectedVariable].unit}
                </td>
                <td style={{ color: 'var(--color-water)', fontWeight: 700 }}>
                  {imputedResults.errors.spline.rmse}
                </td>
                <td>{imputedResults.stats.spline.mean}</td>
                <td>{imputedResults.stats.spline.std}</td>
                <td>[{imputedResults.stats.spline.min}, {imputedResults.stats.spline.max}]</td>
              </tr>
              <tr>
                <td><strong style={{ color: methodColors.linear }}>Linear Interpolation</strong></td>
                <td>zoo::na.approx()</td>
                <td style={{ color: '#f97316', fontWeight: 700 }}>
                  {imputedResults.errors.linear.mae} {variableMeta[selectedVariable].unit}
                </td>
                <td style={{ color: '#f97316', fontWeight: 700 }}>
                  {imputedResults.errors.linear.rmse}
                </td>
                <td>{imputedResults.stats.linear.mean}</td>
                <td>{imputedResults.stats.linear.std}</td>
                <td>[{imputedResults.stats.linear.min}, {imputedResults.stats.linear.max}]</td>
              </tr>
              <tr>
                <td><strong style={{ color: methodColors.loess }}>LOESS Interpolation</strong></td>
                <td>stats::loess(span = 0.5)</td>
                <td style={{ color: '#ec4899', fontWeight: 700 }}>
                  {imputedResults.errors.loess.mae} {variableMeta[selectedVariable].unit}
                </td>
                <td style={{ color: '#ec4899', fontWeight: 700 }}>
                  {imputedResults.errors.loess.rmse}
                </td>
                <td>{imputedResults.stats.loess.mean}</td>
                <td>{imputedResults.stats.loess.std}</td>
                <td>[{imputedResults.stats.loess.min}, {imputedResults.stats.loess.max}]</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
