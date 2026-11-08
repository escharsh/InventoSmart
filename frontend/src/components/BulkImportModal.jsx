import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { bulkImportProducts } from '../api';

export default function BulkImportModal({ onClose, onImportSuccess }) {
  const [csvText, setCsvText] = useState(`SKU,Name,Category,UnitCost,SellingPrice,Quantity,Location
SKU-IMP-101,Dell UltraSharp 27 4K Monitor,Electronics,320.00,480.00,15,Aisle A - Bin 01
SKU-IMP-102,Anker Wireless Charging Pad,Electronics,12.50,25.00,40,Aisle A - Bin 02
SKU-IMP-103,Ergonomic Lumbar Cushion,Office Supplies,15.00,32.00,25,Aisle B - Bin 03`);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setError(null);
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setError('CSV must contain a header row and at least one item row.');
      return;
    }

    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 6) {
        items.push({
          sku: cols[0],
          name: cols[1],
          category_name: cols[2] || 'General',
          unit_cost: parseFloat(cols[3]) || 0,
          selling_price: parseFloat(cols[4]) || 0,
          quantity_on_hand: parseInt(cols[5]) || 0,
          location: cols[6] || 'Warehouse A - Bin 1'
        });
      }
    }

    if (items.length === 0) {
      setError('Could not parse any valid product rows from CSV. Please check formatting.');
      return;
    }

    setLoading(true);
    try {
      const res = await bulkImportProducts(items);
      alert(res.message);
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      setError('Import failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Bulk CSV Product Import</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload a <code>.csv</code> file or paste CSV text below. Format: <code>SKU, Name, Category, UnitCost, SellingPrice, Quantity, Location</code>
        </p>

        {/* File upload input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Upload CSV File
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300 cursor-pointer"
          />
        </div>

        {/* Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            CSV Content Preview / Direct Edit
          </label>
          <textarea
            rows="7"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full p-3 font-mono text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition cursor-pointer"
          >
            {loading ? 'Importing...' : 'Parse & Import Products'}
          </button>
        </div>

      </div>
    </div>
  );
}
