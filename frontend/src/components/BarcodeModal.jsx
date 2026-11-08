import React, { useState } from 'react';
import BarcodeDisplay from './BarcodeDisplay';
import { Printer, Copy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BarcodeModal({ product, onClose }) {
  const { formatCurrency } = useApp();
  const [copied, setCopied] = useState(false);
  if (!product) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(product.barcode || product.sku);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Printable Barcode Label
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{product.name}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{product.sku}</p>
        </div>

        {/* Printable Label Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center">
          <BarcodeDisplay value={product.barcode || product.sku} height={52} />
          
          <div className="w-full mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <span>Loc: {product.location || 'Aisle 1'}</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              Price: {formatCurrency(product.selling_price)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 pt-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            <span>Print Label</span>
          </button>
        </div>

      </div>
    </div>
  );
}
