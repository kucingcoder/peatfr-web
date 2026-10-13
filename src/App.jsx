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
  const [theme, setTheme] = useState('dark');

  // Muat preferensi tema dari localStorage jika tersedia
  useEffect(() => {
    const savedTheme = localStorage.getItem('peatfr-theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

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
