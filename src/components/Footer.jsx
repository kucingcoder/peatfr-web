import React from 'react';

/**
 * Footer
 * Bagian penutup halaman dengan atribusi sumber terbuka dan informasi proyek
 */
export default function Footer({ setActiveTab }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
              PeatFR Explorer
            </span>
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--color-moss-dim)', color: 'var(--color-moss)', fontWeight: 600 }}>
              v1.0.0
            </span>
          </div>
          <p className="footer-text" style={{ maxWidth: '480px', margin: 0 }}>
            Aplikasi web interaktif pemantauan hidrologi gambut dan prediksi risiko kebakaran gambut tropis. Diadaptasi dari paket R <em>peatfr</em> (Melly Guslina et al.) dan formulasi Taufik et al. (2022).
          </p>
        </div>

        <ul className="footer-links">
          <li>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
            >
              Simulator
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setActiveTab('imputasi')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
            >
              Imputasi
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setActiveTab('peramalan')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
            >
              Peramalan
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setActiveTab('dataset')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
            >
              Data Lapangan
            </button>
          </li>
          <li>
            <a
              href="https://github.com/mellygsln/peatfr"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
              style={{ color: 'var(--color-moss)', fontWeight: 600 }}
            >
              GitHub peatfr
            </a>
          </li>
        </ul>
      </div>

      <div style={{ maxWidth: '1200px', margin: '1.25rem auto 0', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Standar Perlindungan Ekosistem Gambut PP No. 57/2016</span>
      </div>
    </footer>
  );
}
