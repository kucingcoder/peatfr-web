import React from 'react';

/**
 * Navbar
 * Header situs dengan logo SVG, judul, navigasi tab/section,
 * serta tombol alih tema (Peat Dark / Field Guide Light).
 */
export default function Navbar({ activeTab, setActiveTab, theme, setTheme }) {
  const navItems = [
    { id: 'simulator', label: 'Simulator & Penampang' },
    { id: 'imputasi', label: 'Imputasi Sensor' },
    { id: 'peramalan', label: 'Peramalan Waktu' },
    { id: 'dataset', label: 'Data Lapangan' },
    { id: 'metodologi', label: 'Metodologi & R' }
  ];

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('peatfr-theme', nextTheme);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand Info */}
        <div className="brand-wrapper">
          <svg className="brand-logo-svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#13231a"/>
            <path d="M4 18C8 17 12 19 16 18C20 17 24 18 28 17V26C28 27.1 27.1 28 26 28H6C4.9 28 4 27.1 4 26V18Z" fill="#5a3825"/>
            <path d="M4 21C8 20.5 12 21.5 16 21C20 20.5 24 21.2 28 20.5V26C28 27.1 27.1 28 26 28H6C4.9 28 4 27.1 4 26V21Z" fill="#0284c7" opacity="0.85"/>
            <path d="M8 17C8 13 12 11 12 8C12 11 16 13 16 17H8Z" fill="#22c55e"/>
            <circle cx="23" cy="12" r="3.5" fill="#f97316"/>
            <circle cx="23" cy="12" r="2" fill="#ef4444"/>
          </svg>
          <div className="brand-info">
            <span className="brand-title">PeatFR</span>
            <span className="brand-subtitle">Tropical Peatland Fire Risk</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Tombol Tema */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Ganti ke tema ${theme === 'dark' ? 'terang' : 'gelap'}`}
            title={`Tema saat ini: ${theme === 'dark' ? 'Peat Dark' : 'Field Light'}`}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
            <span style={{ display: 'none' }} className="theme-text-desktop">
              {theme === 'dark' ? 'Peat Dark' : 'Field Light'}
            </span>
          </button>
        </div>
      </div>

      {/* Nav Tabs Bar */}
      <nav className="nav-tabs-wrapper" aria-label="Navigasi Modul PeatFR">
        <ul className="nav-tabs-list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`tab-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
