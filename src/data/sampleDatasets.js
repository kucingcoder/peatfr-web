import rawTestingCsv from '../assets/Data Testing.csv?raw';
import testingDataJson from './testingData.json';

/**
 * Dataset Pengujian Lahan Gambut (src/assets/Data Testing.csv)
 * Berisi 192 baris rekaman runtun waktu sensor hidrologi dan meteorologi gambut:
 * - Temperature (°C)
 * - Water Table (meter)
 * - Soil Moisture (%)
 * - Rainfall (milimeter)
 *
 * Tanpa data buatan atau nama lokasi fiktif.
 */

function parseTestingCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') return null;
  const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return null;

  // Header inspeksi kolom
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const tempIdx = header.findIndex(h => h.includes('temp'));
  const wtIdx = header.findIndex(h => h.includes('water') || h.includes('wt'));
  const smIdx = header.findIndex(h => h.includes('moisture') || h.includes('sm'));
  const rfIdx = header.findIndex(h => h.includes('rain') || h.includes('rf'));

  const dates = [];
  const WT = [];
  const SM = [];
  const Rf = [];
  const Temp = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim());
    if (parts.length < 4) continue;
    dates.push(`Data-${i}`);
    Temp.push(tempIdx >= 0 ? parseFloat(parts[tempIdx]) : parseFloat(parts[0]));
    WT.push(wtIdx >= 0 ? parseFloat(parts[wtIdx]) : parseFloat(parts[1]));
    SM.push(smIdx >= 0 ? parseFloat(parts[smIdx]) : parseFloat(parts[2]));
    Rf.push(rfIdx >= 0 ? parseFloat(parts[rfIdx]) : parseFloat(parts[3]));
  }

  if (dates.length === 0) return null;

  return {
    id: 'data-testing',
    name: 'Data Testing.csv',
    fileName: 'Data Testing.csv',
    description: 'Dataset sensor riil dari berkas src/assets/Data Testing.csv (192 baris observasi waktu).',
    R0: 2850,
    dt: 1,
    dates,
    WT,
    SM,
    Rf,
    Temp
  };
}

const parsedDataset = parseTestingCsv(rawTestingCsv);

export const TESTING_DATASET = parsedDataset || {
  id: 'data-testing',
  name: 'Data Testing.csv',
  fileName: 'Data Testing.csv',
  description: 'Dataset sensor riil dari berkas src/assets/Data Testing.csv (192 baris observasi waktu).',
  R0: 2850,
  dt: 1,
  dates: testingDataJson.dates,
  WT: testingDataJson.WT,
  SM: testingDataJson.SM,
  Rf: testingDataJson.Rf,
  Temp: testingDataJson.Temp
};

export const SAMPLE_DATASETS = [TESTING_DATASET];

export default TESTING_DATASET;
