import React, { useState } from 'react';
import { Sliders, Plus, Minus } from 'lucide-react';

export default function QuickAdjustModal({ product, onClose, onSave }) {
  const [adjustment, setAdjustment] = useState(1);
  const [isAddition, setIsAddition] = useState(true);
  const [reason, setReason] = useState('Cycle count audit correction');
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const currentStock = product.quantity_on_hand;
  const delta = isAddition ? Math.abs(adjustment) : -Math.abs(adjustment);
  const newStock = Math.max(0, currentStock + delta);

  const reasonsList = [
    'Cycle count audit correction',
    'Damaged / Expired stock write-off',
    'Customer return restock',
    'Internal showroom transfer',
    'Emergency manual restock'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (delta === 0) return;
    setLoading(true);
    try {
      await onSave(product.id, delta, reason);
      onClose();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Stock Adjustment</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{product.name}</h4>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{product.sku}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Operation Direction */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setIsAddition(true)}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center transition cursor-pointer ${
                isAddition ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Stock (+)
            </button>
            <button
              type="button"
              onClick={() => setIsAddition(false)}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center transition cursor-pointer ${
                !isAddition ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Minus className="w-3.5 h-3.5 mr-1" />
              Reduce Stock (-)
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Adjustment Quantity</label>
            <input
              type="number"
              min="1"
              max={!isAddition ? currentStock : 9999}
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-bold text-center"
              required
            />
          </div>

          {/* Balance Preview */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Current</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{currentStock}</span>
            </div>
            <div className="text-slate-400 dark:text-slate-600">&rarr;</div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">After Adjustment</span>
              <span className={`font-bold ${isAddition ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {newStock} {product.unit}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Reason for Adjustment</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {reasonsList.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || delta === 0}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition cursor-pointer"
            >
              {loading ? 'Saving...' : 'Confirm Update'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
