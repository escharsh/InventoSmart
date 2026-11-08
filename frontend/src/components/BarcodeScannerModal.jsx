import React, { useState, useEffect, useRef } from 'react';
import { Scan, Search, CheckCircle2, AlertCircle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { lookupBarcode, quickAdjustStock } from '../api';
import { useApp } from '../context/AppContext';

export default function BarcodeScannerModal({ onClose, onStockUpdated }) {
  const { formatCurrency } = useApp();
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [adjustSuccess, setAdjustSuccess] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleScan = async (codeToSearch) => {
    const code = (codeToSearch || inputCode).trim();
    if (!code) return;

    setLoading(true);
    setError(null);
    setProduct(null);
    setAdjustSuccess(null);

    try {
      const data = await lookupBarcode(code);
      setProduct(data);
    } catch (err) {
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScan();
    }
  };

  const handleQuickAdjust = async (qtyDelta) => {
    if (!product) return;
    try {
      const res = await quickAdjustStock(
        product.id,
        qtyDelta,
        qtyDelta > 0 ? 'Barcode Scanner Quick Restock' : 'Barcode Scanner Quick Dispatch'
      );
      setProduct({ ...product, quantity_on_hand: res.new_stock });
      setAdjustSuccess(`Stock updated! New balance: ${res.new_stock} ${product.unit}`);
      if (onStockUpdated) onStockUpdated();
      setTimeout(() => setAdjustSuccess(null), 3000);
    } catch (err) {
      alert('Error updating stock: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Barcode & SKU Scanner</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Scan laser hardware or enter code</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
        </div>

        {/* Scanner Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Scan or Enter Barcode / SKU
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. 8901001001 or SKU-TECH-001"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-3.5 pr-20 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              onClick={() => handleScan()}
              disabled={loading}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
            >
              {loading ? '...' : 'Scan'}
            </button>
          </div>
        </div>

        {/* Quick demo sample pills */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Test Samples:</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {['8901001001', '8901001002', '8902002001', '8903003003'].map(code => (
              <button
                key={code}
                onClick={() => {
                  setInputCode(code);
                  handleScan(code);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 font-mono text-[10px] text-slate-600 dark:text-slate-300 transition cursor-pointer border border-slate-200/60 dark:border-slate-700"
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Adjust success banner */}
        {adjustSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{adjustSuccess}</span>
          </div>
        )}

        {/* Scanned Product Card */}
        {product && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{product.name}</h4>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  <span>{product.sku}</span>
                  <span>&bull;</span>
                  <span>{product.location}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                product.quantity_on_hand === 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                product.quantity_on_hand <= product.min_reorder_level ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {product.quantity_on_hand === 0 ? 'Out of stock' :
                 product.quantity_on_hand <= product.min_reorder_level ? 'Low Stock' : 'In Stock'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px]">On Hand</span>
                <span className="font-extrabold text-base text-slate-900 dark:text-white font-mono">
                  {product.quantity_on_hand} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{product.unit}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Selling Price</span>
                <span className="font-bold text-base text-slate-900 dark:text-white font-mono">
                  {formatCurrency(product.selling_price)}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons right inside scanner */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-2">Immediate Stock Adjustment:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickAdjust(1)}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center transition shadow-xs cursor-pointer"
                >
                  <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
                  <span>+1 Restock</span>
                </button>
                <button
                  onClick={() => handleQuickAdjust(-1)}
                  disabled={product.quantity_on_hand <= 0}
                  className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                  <span>-1 Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
