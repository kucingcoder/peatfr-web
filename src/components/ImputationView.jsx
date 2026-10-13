import React, { useState, useMemo } from 'react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { ImputationMethods } from '../utils/peatfrMath';

/**
 * ImputationView
 * Modul Evaluasi & Visualisasi 4 Metode Imputasi Data Hilang (NA)
 * Berdasarkan paket peatfr: k-NN, Spline, Linear, LOESS
 */
export default function ImputationView() {
  const [selectedDatasetId, setSelectedDatasetId] = useState('kampar-riau');
  const [selectedVariable, setSelectedVariable] = useState('WT');
  const [activeMethod, setActiveMethod] = useState('knn'); // 'knn', 'spline', 'linear', 'loess', 'all'

  const currentDataset = useMemo(() => {
    return SAMPLE_DATASETS.find(d => d.id === selectedDatasetId) || SAMPLE_DATASETS[0];
  }, [selectedDatasetId]);

  // Ekstrak data asli dengan nilai null (NA)
  const rawSeries = useMemo(() => {
    return currentDataset[selectedVariable] || [];
  }, [currentDataset, selectedVariable]);

  // Hitung imputasi untuk masing-masing metode
  const imputedResults = useMemo(() => {
    const linear = ImputationMethods.linear(rawSeries);
    const spline = ImputationMethods.spline(rawSeries);
    const knn = ImputationMethods.knn(rawSeries, 5);
    const loess = ImputationMethods.loess(rawSeries, 0.5);

    // Hitung statistik
    const missingCount = rawSeries.filter(v => v === null || v === undefined || isNaN(v)).length;
    const missingPercent = ((missingCount / rawSeries.length) * 100).toFixed(1);

    const calcStats = (arr) => {
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
      }
    };
  }, [rawSeries]);

  const variableMeta = {
    WT: { label: 'Muka Air Tanah (WT)', unit: 'meter', color: '#0ea5e9' },
    SM: { label: 'Kelembaban Tanah (SM)', unit: '%', color: '#10b981' },
    Rf: { label: 'Curah Hujan (Rf)', unit: 'mm/hari', color: '#38bdf8' },
    Temp: { label: 'Suhu Udara (Temp)', unit: '°C', color: '#f59e0b' }
  };

  const methodColors = {
    knn: '#8b5cf6',
    spline: '#06b6d4',
    linear: '#f97316',
    loess: '#ec4899'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Kartu Header & Pemilih Dataset */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title">Imputasi Data Sensor Runtun Waktu</h2>
            <p className="card-subtitle">
              Sensor lahan gambut di pedalaman sering terputus akibat cuaca ekstrem. Bandingkan 4 algoritma estimasi data hilang dari paket peatfr.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Pemilih Dataset */}
            <div>
              <label htmlFor="dataset-select" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Lokasi Pengamatan:
              </label>
              <select
                id="dataset-select"
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                className="input-select"
                style={{ minHeight: '38px', padding: '4px 10px', fontSize: '0.85rem' }}
              >
                {SAMPLE_DATASETS.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.province})</option>
                ))}
              </select>
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
              Plot Perbandingan Nilai Sensor Asli vs Hasil Imputasi
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Titik merah menandai observasi hilang (NA) yang diisi kembali oleh algoritma
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--risk-high-bg)',
              color: 'var(--risk-high)',
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
                      {yVal.toFixed(1)}
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
                  // Titik imputasi yang diisi (gunakan nilai dari metode yang aktif)
                  const chosenVal = activeMethod === 'all' || activeMethod === 'knn'
                    ? imputedResults.knn[idx]
                    : imputedResults[activeMethod][idx];
                  const yPos = getY(chosenVal);

                  return (
                    <g key={idx}>
                      <circle cx={xPos} cy={yPos} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      <line x1={xPos} y1={yPos - 8} x2={xPos} y2={padT} stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
                    </g>
                  );
                } else {
                  const yPos = getY(v);
                  return (
                    <circle key={idx} cx={xPos} cy={yPos} r="3.5" fill="var(--color-moss)" />
                  );
                }
              })}

              {/* Label Sumbu X (Tanggal) */}
              {dates.map((d, idx) => {
                if (idx % 3 === 0 || idx === n - 1) {
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', border: '1px solid #fff' }} />
            Titik Imputasi (Data Hilang)
          </span>
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

      {/* Tabel Evaluasi Statistik 4 Algoritma */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>
          Perbandingan Karakteristik Algoritma Imputasi
        </h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metode Imputasi</th>
                <th>Paket R Asli</th>
                <th>Rerata (Mean)</th>
                <th>Standar Deviasi</th>
                <th>Rentang [Min, Max]</th>
                <th>Karakteristik Lapangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style={{ color: methodColors.knn }}>k-NN Imputation</strong></td>
                <td>VIM::kNN(k = 5)</td>
                <td>{imputedResults.stats.knn.mean}</td>
                <td>{imputedResults.stats.knn.std}</td>
                <td>[{imputedResults.stats.knn.min}, {imputedResults.stats.knn.max}]</td>
                <td>Mempertahankan struktur lokal dari 5 observasi tetangga terdekat.</td>
              </tr>
              <tr>
                <td><strong style={{ color: methodColors.spline }}>Spline Interpolation</strong></td>
                <td>zoo::na.spline()</td>
                <td>{imputedResults.stats.spline.mean}</td>
                <td>{imputedResults.stats.spline.std}</td>
                <td>[{imputedResults.stats.spline.min}, {imputedResults.stats.spline.max}]</td>
                <td>Kurva polinomial halus, sangat baik untuk penurunan muka air bertahap.</td>
              </tr>
              <tr>
                <td><strong style={{ color: methodColors.linear }}>Linear Interpolation</strong></td>
                <td>zoo::na.approx()</td>
                <td>{imputedResults.stats.linear.mean}</td>
                <td>{imputedResults.stats.linear.std}</td>
                <td>[{imputedResults.stats.linear.min}, {imputedResults.stats.linear.max}]</td>
                <td>Garis lurus sederhana antar titik valid; cepat dan stabil.</td>
              </tr>
              <tr>
                <td><strong style={{ color: methodColors.loess }}>LOESS Interpolation</strong></td>
                <td>stats::loess(span = 0.5)</td>
                <td>{imputedResults.stats.loess.mean}</td>
                <td>{imputedResults.stats.loess.std}</td>
                <td>[{imputedResults.stats.loess.min}, {imputedResults.stats.loess.max}]</td>
                <td>Regresi berbobot lokal dengan pembobotan tri-cube; tahan derau tinggi.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
