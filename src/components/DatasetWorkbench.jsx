import React, { useState, useMemo } from 'react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { ImputationMethods, simulatePFVI, optimizeParameters, getPFVIRiskCategory } from '../utils/peatfrMath';

/**
 * DatasetWorkbench
 * Eksplorasi data sensor lahan gambut Indonesia, pengunggahan CSV kustom,
 * kalibrasi Nelder-Mead, dan ekspor laporan mitigasi.
 */
export default function DatasetWorkbench() {
  const [selectedDatasetId, setSelectedDatasetId] = useState('kampar-riau');
  const [customDataset, setCustomDataset] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [calibrationResult, setCalibrationResult] = useState(null);

  const activeData = useMemo(() => {
    if (selectedDatasetId === 'custom' && customDataset) return customDataset;
    return SAMPLE_DATASETS.find(d => d.id === selectedDatasetId) || SAMPLE_DATASETS[0];
  }, [selectedDatasetId, customDataset]);

  // Siapkan data terimputasi dan kalkulasi PFVI penuh
  const computedAnalysis = useMemo(() => {
    const wtClean = ImputationMethods.spline(activeData.WT);
    const smClean = ImputationMethods.spline(activeData.SM);
    const rfClean = ImputationMethods.spline(activeData.Rf);
    const tempClean = ImputationMethods.spline(activeData.Temp);

    const params = calibrationResult ? calibrationResult.params : [0.25, 0.18, 1.45, 0.35];
    const sim = simulatePFVI(wtClean, smClean, rfClean, tempClean, params, activeData.R0 || 3000, activeData.dt || 1);

    const latestPfvi = sim.pfvi[sim.pfvi.length - 1] || 0;
    const latestRisk = getPFVIRiskCategory(latestPfvi);

    return {
      wtClean,
      smClean,
      rfClean,
      tempClean,
      pfvi: sim.pfvi,
      diObs: sim.diObs,
      latestPfvi,
      latestRisk
    };
  }, [activeData, calibrationResult]);

  // Handle Unggah CSV
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) return;

      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const wtIdx = header.findIndex(h => h.includes('wt') || h.includes('water'));
      const smIdx = header.findIndex(h => h.includes('sm') || h.includes('moisture'));
      const rfIdx = header.findIndex(h => h.includes('rf') || h.includes('rain'));
      const tempIdx = header.findIndex(h => h.includes('temp'));

      const dates = [];
      const WT = [];
      const SM = [];
      const Rf = [];
      const Temp = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        dates.push(`Data-${i}`);
        WT.push(wtIdx >= 0 && parts[wtIdx] !== '' && parts[wtIdx] !== 'NA' ? parseFloat(parts[wtIdx]) : null);
        SM.push(smIdx >= 0 && parts[smIdx] !== '' && parts[smIdx] !== 'NA' ? parseFloat(parts[smIdx]) : null);
        Rf.push(rfIdx >= 0 && parts[rfIdx] !== '' && parts[rfIdx] !== 'NA' ? parseFloat(parts[rfIdx]) : null);
        Temp.push(tempIdx >= 0 && parts[tempIdx] !== '' && parts[tempIdx] !== 'NA' ? parseFloat(parts[tempIdx]) : null);
      }

      setCustomDataset({
        id: 'custom',
        name: file.name.replace('.csv', ''),
        province: 'Data Unggahan Pengguna',
        ecosystemType: 'CSV Dataset Eksternal',
        description: `Dataset kustom berhasil diimpor dengan ${lines.length - 1} baris observasi waktu.`,
        dates,
        WT,
        SM,
        Rf,
        Temp,
        R0: 2900,
        dt: 1
      });
      setSelectedDatasetId('custom');
      setCalibrationResult(null);
    };
    reader.readAsText(file);
  };

  // Jalankan Optimasi Simplex Nelder-Mead
  const runNelderMead = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const res = optimizeParameters(
        computedAnalysis.wtClean,
        computedAnalysis.smClean,
        computedAnalysis.rfClean,
        computedAnalysis.tempClean,
        activeData.R0 || 3000,
        activeData.dt || 1
      );
      setCalibrationResult(res);
      setIsOptimizing(false);
    }, 150);
  };

  // Ekspor CSV
  const exportCSV = () => {
    let csv = 'Tanggal,WT_Obs,WT_Imputed,SM_Obs,SM_Imputed,Rf_Obs,Rf_Imputed,Temp_Obs,Temp_Imputed,DI_Obs,PFVI_Index\n';
    activeData.dates.forEach((d, i) => {
      const row = [
        d,
        activeData.WT[i] !== null ? activeData.WT[i] : 'NA',
        computedAnalysis.wtClean[i].toFixed(3),
        activeData.SM[i] !== null ? activeData.SM[i] : 'NA',
        computedAnalysis.smClean[i].toFixed(2),
        activeData.Rf[i] !== null ? activeData.Rf[i] : 'NA',
        computedAnalysis.rfClean[i].toFixed(2),
        activeData.Temp[i] !== null ? activeData.Temp[i] : 'NA',
        computedAnalysis.tempClean[i].toFixed(2),
        computedAnalysis.diObs[i].toFixed(2),
        computedAnalysis.pfvi[i].toFixed(2)
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PeatFR_Laporan_${activeData.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Kartu Header & Pemilih Dataset */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title">Eksplorasi Data Lapangan & Unggah CSV</h2>
            <p className="card-subtitle">
              Pilih dari stasiun pemantauan gambut benchmark Indonesia atau unggah berkas CSV data telemetri Anda sendiri.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="input-select"
              style={{ minHeight: '40px', width: 'auto', fontSize: '0.88rem' }}
            >
              {SAMPLE_DATASETS.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.province})</option>
              ))}
              {customDataset && <option value="custom">File Kustom: {customDataset.name}</option>}
            </select>

            <label className="btn btn-secondary" style={{ minHeight: '40px', padding: '6px 14px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <span>Unggah File CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            <button
              type="button"
              className="btn btn-primary"
              onClick={exportCSV}
              style={{ minHeight: '40px', padding: '6px 14px', fontSize: '0.85rem' }}
            >
              Ekspor Hasil Analisis (CSV)
            </button>
          </div>
        </div>

        {/* Info Ringkas Ekosistem Terpilih */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tipe Ekosistem</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeData.ecosystemType}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kedalaman Gambut</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-moss)' }}>{activeData.peatDepth || 'Variatif'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status Kerentanan Akhir</div>
            <span className={`risk-pill ${computedAnalysis.latestRisk.statusClass}`}>
              PFVI: {computedAnalysis.latestPfvi.toFixed(1)} ({computedAnalysis.latestRisk.level})
            </span>
          </div>
        </div>
      </div>

      {/* Optimasi Nelder-Mead Parameters */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 className="card-title">Kalibrasi Parameter Van Genuchten (Nelder-Mead)</h3>
            <p className="card-subtitle">
              Sesuai firepredict() di paket peatfr: kalibrasi [aH, bH, n, alpha] untuk meminimalkan deviasi indeks.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={runNelderMead}
            disabled={isOptimizing}
            style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
          >
            {isOptimizing ? 'Mengoptimasi...' : 'Jalankan Kalibrasi Nelder-Mead'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          <div className="stat-box">
            <div className="stat-label">Parameter aH</div>
            <div className="stat-value">{calibrationResult ? calibrationResult.params[0] : '0.250'}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Parameter bH</div>
            <div className="stat-value">{calibrationResult ? calibrationResult.params[1] : '0.180'}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Parameter n</div>
            <div className="stat-value">{calibrationResult ? calibrationResult.params[2] : '1.450'}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Parameter alpha (α)</div>
            <div className="stat-value">{calibrationResult ? calibrationResult.params[3] : '0.350'}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Error MSE Fit</div>
            <div className="stat-value" style={{ color: 'var(--color-moss)' }}>
              {calibrationResult ? calibrationResult.mse : '14.28'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Data Sensor Lengkap */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 className="card-title">Tabel Runtun Waktu Sensor & Nilai Imputasi</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Menampilkan {activeData.dates.length} Titik Observasi
          </span>
        </div>

        <div className="table-wrapper" style={{ maxHeight: '380px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Muka Air (WT, m)</th>
                <th>Kelembaban (SM, %)</th>
                <th>Curah Hujan (Rf, mm)</th>
                <th>Suhu (Temp, °C)</th>
                <th>PFVI Dihitung</th>
                <th>Tingkat Risiko</th>
              </tr>
            </thead>
            <tbody>
              {activeData.dates.map((d, i) => {
                const isWTNa = activeData.WT[i] === null;
                const isSMNa = activeData.SM[i] === null;
                const isRfNa = activeData.Rf[i] === null;
                const isTempNa = activeData.Temp[i] === null;

                const pfviVal = computedAnalysis.pfvi[i];
                const riskCat = getPFVIRiskCategory(pfviVal);

                return (
                  <tr key={i}>
                    <td><strong>{d}</strong></td>
                    <td>
                      {isWTNa ? (
                        <span className="missing-cell">NA → {computedAnalysis.wtClean[i].toFixed(2)}</span>
                      ) : (
                        activeData.WT[i].toFixed(2)
                      )}
                    </td>
                    <td>
                      {isSMNa ? (
                        <span className="missing-cell">NA → {computedAnalysis.smClean[i].toFixed(1)}%</span>
                      ) : (
                        `${activeData.SM[i].toFixed(1)}%`
                      )}
                    </td>
                    <td>
                      {isRfNa ? (
                        <span className="missing-cell">NA → {computedAnalysis.rfClean[i].toFixed(1)}</span>
                      ) : (
                        activeData.Rf[i].toFixed(1)
                      )}
                    </td>
                    <td>
                      {isTempNa ? (
                        <span className="missing-cell">NA → {computedAnalysis.tempClean[i].toFixed(1)}°C</span>
                      ) : (
                        `${activeData.Temp[i].toFixed(1)}°C`
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: riskCat.color }}>
                      {pfviVal.toFixed(1)}
                    </td>
                    <td>
                      <span className={`risk-pill ${riskCat.statusClass}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        {riskCat.level}
                      </span>
                    </td>
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
