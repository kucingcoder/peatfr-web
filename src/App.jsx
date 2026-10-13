import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import InteractiveSandbox from './components/InteractiveSandbox';
import ImputationView from './components/ImputationView';
import ForecastingView from './components/ForecastingView';
import DatasetWorkbench from './components/DatasetWorkbench';
import MethodologyGuide from './components/MethodologyGuide';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('peatfr-theme') || 'dark';
    }
    return 'dark';
  });

  // Sinkronisasi data-theme saat tema berubah
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-container">
      {/* Header & Navigasi */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Konten Utama Berdasarkan Tab Aktif */}
      <main className="main-content" id="main-content" role="main">
        {activeTab === 'simulator' && <InteractiveSandbox />}
        {activeTab === 'imputasi' && <ImputationView />}
        {activeTab === 'peramalan' && <ForecastingView />}
        {activeTab === 'dataset' && <DatasetWorkbench />}
        {activeTab === 'metodologi' && <MethodologyGuide />}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
