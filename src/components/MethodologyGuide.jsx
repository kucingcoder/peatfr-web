import React, { useState } from 'react';
import HydrologyCycleSVG from './HydrologyCycleSVG';

/**
 * MethodologyGuide
 * Dokumentasi Ilmiah, Landasan Regulasi PP 57/2016 & BRGM,
 * serta Kode Replikasi R untuk Paket peatfr
 */
export default function MethodologyGuide() {
  const [copied, setCopied] = useState(false);

  const rCodeSnippet = `# Instalasi & Penggunaan Paket peatfr di R
# Repositori Resmi: https://github.com/mellygsln/peatfr

# 1. Pasang paket dependensi
install.packages("devtools")
devtools::install_github("mellygsln/peatfr", dependencies = TRUE)

# 2. Muat pustaka
library(peatfr)

# 3. Contoh Vektor Sensor Gambut (dengan missing values NA)
WT <- c(-0.22, -0.26, -0.31, NA, -0.39, -0.44, -0.48, -0.52, -0.56, -0.61, NA, -0.69)
SM <- c(62.4, 59.8, 56.1, NA, 48.5, 45.2, 42.0, 39.4, 37.8, 36.1, NA, 33.5)
Rf <- c(12.4, 0.0, 0.0, NA, 0.0, 0.0, 1.2, 0.0, 0.0, 0.0, NA, 0.0)
Temp <- c(30.5, 31.2, 32.0, NA, 32.8, 33.5, 33.9, 34.2, 34.6, 35.0, NA, 35.8)

# 4. Jalankan Prediksi Menyeluruh (Imputasi k-NN + Peramalan ARIMA + Optimasi Nelder-Mead)
hasil <- autopeatfr(
  WT = WT,
  SM = SM,
  Rf = Rf,
  Temp = Temp,
  imputation = "knn",
  model = "arima",
  h = 4,
  R0 = 2850,
  dt = 1
)

# 5. Tampilkan Nilai Indeks Kerentanan (PFVI)
print(hasil)
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Diagram Alir Hidrologi SVG */}
      <HydrologyCycleSVG />

      {/* Rincian Persamaan Matematis */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>
          Formulasi Matematis Peat Fire Vulnerability Index (PFVI)
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          Berdasarkan model neraca air dan kekeringan lahan gambut tropis (Taufik et al., 2022):
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Rumus 1: DIobs */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--color-moss)', margin: '0 0 0.5rem', fontSize: '0.92rem' }}>
              1. Indeks Kekeringan Teramati (DIobs)
            </h4>
            <div className="code-block" style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
              DIobs = 300 × [1 - (SM - fc) / (sat - fc)]
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>
              Dihitung dari kelembaban tanah (SM) dengan kapasitas lapang fc = 40% dan kejenuhan sat = 70%. Nilai berada pada rentang 0 s/d 300.
            </p>
          </div>

          {/* Rumus 2: Faktor Kekeringan DF */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: '#eab308', margin: '0 0 0.5rem', fontSize: '0.92rem' }}>
              2. Laju Pengeringan Harian (DF)
            </h4>
            <div className="code-block" style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
              DF = (300 - nPFVI) × [0.4982 × exp(0.0905×T + 1.6096) - 4.268] × dt × 10⁻³ / [1 + 10.88 × exp(-0.001736 × R0)]
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>
              Memodelkan evapotranspirasi potensial dan kehilangan air akibat suhu tinggi harian (T) dan curah hujan tahunan (R0).
            </p>
          </div>

          {/* Rumus 3: Reduksi Hujan RF */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: '#0ea5e9', margin: '0 0 0.5rem', fontSize: '0.92rem' }}>
              3. Faktor Efek Hujan (RF)
            </h4>
            <div className="code-block" style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
              Jika Rf_prev ≤ 5.1 mm:
                RF = Rf &lt; 5.1 ? 0 : Rf - 5.1
              Lainnya: RF = Rf
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>
              Memperhitungkan kehilangan intersepsi kanopi hutan gambut; hujan di bawah 5.1 mm tidak langsung membasahi lapisan tanah dalam.
            </p>
          </div>

          {/* Rumus 4: Fluktuasi Retensi Van Genuchten WTF */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: '#f97316', margin: '0 0 0.5rem', fontSize: '0.92rem' }}>
              4. Retensi Air Tanah Van Genuchten (WTF)
            </h4>
            <div className="code-block" style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
              θ = [1 + (h / α)ⁿ]⁻⁽¹⁻¹/ⁿ⁾
              WTF = aH - bH × [(1 - θ) × 300]
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>
              Menghubungkan kedalaman muka air (h) dengan daya hisap kapiler matriks tanah gambut berserat melalui parameter [aH, bH, n, α].
            </p>
          </div>
        </div>
      </div>

      {/* Kebijakan PP 57/2016 & Standar BRGM */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>
          Kerangka Regulasi & Strategi Mitigasi Bencana Gambut
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', borderLeft: '4px solid var(--risk-high)' }}>
            <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-primary)' }}>
              Peraturan Pemerintah No. 57 Tahun 2016 jo. PP No. 71/2014
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              Pemerintah Republik Indonesia menetapkan bahwa <strong>tinggi muka air tanah pada lahan gambut tidak boleh lebih rendah dari 0.4 meter (40 cm)</strong> di bawah permukaan gambut pada titik penaatan hidrologis. Penurunan di bawah batas 40 cm menandakan ekosistem gambut dalam kondisi rusak dan rawan terbakar.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', borderLeft: '4px solid var(--color-moss)' }}>
            <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-primary)' }}>
              Strategi Restorasi 3R (Badan Restorasi Gambut dan Mangrove - BRGM)
            </h4>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li><strong>Rewetting (Pembasahan Kembali):</strong> Pembangunan sekat kanal (canal blocking), penimbunan kanal, dan sumur bor air tanah untuk mempertahankan muka air di atas -0.4 meter.</li>
              <li><strong>Revegetation (Penanaman Kembali):</strong> Penanaman spesies pohon rawa lokal (jelutung, ramin, belangeran) untuk memulihkan tutupan kanopi dan retensi kelembaban.</li>
              <li><strong>Revitalization (Revitalisasi Ekonomi):</strong> Pengelolaan paludikultur (budidaya ramah lahan basah seperti sagu dan purun) tanpa membakar.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Snippet Kode R library(peatfr) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 className="card-title">Replikasi pada Lingkungan R (RStudio)</h3>
            <p className="card-subtitle">
              Gunakan cuplikan skrip R ini untuk mereplikasi analisis di desktop Anda menggunakan paket asli peatfr
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={copyToClipboard}
            style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
          >
            {copied ? 'Tersalin ke Clipboard!' : 'Salin Kode R'}
          </button>
        </div>

        <pre className="code-block" style={{ maxHeight: '320px' }}>
          <code>{rCodeSnippet}</code>
        </pre>
      </div>

      {/* Referensi Ilmiah */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>
          Referensi Ilmiah Terkait
        </h3>
        <ol style={{ margin: '0 0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <li>
            Taufik, M., Widyastuti, M. T., Sulaiman, A., Murdiyarso, D., Santikayasa, I. P., & Minasny, B. (2022).
            <em> An improved drought-fire assessment for managing fire risks in tropical peatlands</em>.
            Agricultural and Forest Meteorology, 312, 108738.
          </li>
          <li>
            Nelder, J. A., & Mead, R. (1965).
            <em> A Simplex Method for Function Minimization</em>.
            The Computer Journal, 7(4), 308-313.
          </li>
          <li>
            Guslina, Melly. et al. (2024).
            <em> peatfr: Peat Fire Risk Forecasting Package</em>.
            GitHub: <a href="https://github.com/mellygsln/peatfr" target="_blank" rel="noreferrer" style={{ color: 'var(--color-moss)' }}>https://github.com/mellygsln/peatfr</a>.
          </li>
          <li>
            Kowarik, A., & Templ, M. (2016).
            <em> Imputation with the R Package VIM</em>.
            Journal of Statistical Software, 74(7), 1-16.
          </li>
        </ol>
      </div>
    </div>
  );
}
