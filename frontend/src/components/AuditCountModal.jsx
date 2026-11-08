import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { reconcileAudit } from '../api';

export default function AuditCountModal({ products = [], onClose, onReconciled }) {
  const [auditorName, setAuditorName] = useState('Staff Auditor');
  const [counts, setCounts] = useState(() => {
    const init = {};
    products.forEach(p => {
      init[p.id] = p.quantity_on_hand; // default to current
    });
    return init;
  });
  const [loading, setLoading] = useState(false);

  const handleCountChange = (productId, val) => {
    setCounts(prev => ({
      ...prev,
      [productId]: Math.max(0, parseInt(val) || 0)
    }));
  };

  const variances = products.map(p => {
    const counted = counts[p.id] !== undefined ? counts[p.id] : p.quantity_on_hand;
    const diff = counted - p.quantity_on_hand;
    return {
      product: p,
      counted,
      diff
    };
  }).filter(v => v.diff !== 0);

  const handleSubmit = async () => {
    if (variances.length === 0) {
      alert('No count discrepancies found. All physical counts match database records!');
      onClose();
      return;
    }

    if (!confirm(`Reconcile ${variances.length} count discrepancies? This will automatically update product stock and create immutable audit records.`)) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        auditor_name: auditorName,
        items: variances.map(v => ({
          product_id: v.product.id,
          physical_count: v.counted,
          notes: `Audit discrepancy: counted ${v.counted} vs expected ${v.product.quantity_on_hand}`
        }))
      };

      await reconcileAudit(payload);
      alert('Inventory successfully reconciled!');
      if (onReconciled) onReconciled();
      onClose();
    } catch (err) {
      alert('Error reconciling audit: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Physical Inventory Stock Take & Cycle Audit</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Enter counted quantities to compute variances and automatically reconcile stock</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
        </div>

        {/* Auditor Name */}
        <div className="flex items-center space-x-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <label className="font-bold text-slate-700 dark:text-slate-300">Auditor Name / Team:</label>
          <input
            type="text"
            value={auditorName}
            onChange={(e) => setAuditorName(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
          />
          <div className="ml-auto font-mono">
            Discrepancies found: <span className="font-bold text-amber-600 dark:text-amber-400">{variances.length} items</span>
          </div>
        </div>

        {/* Audit List Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Item & SKU</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-center">System Expected</th>
                <th className="py-2.5 px-3 text-center">Physical Count</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {products.map(p => {
                const counted = counts[p.id] !== undefined ? counts[p.id] : p.quantity_on_hand;
                const diff = counted - p.quantity_on_hand;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{p.location}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {p.quantity_on_hand}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={counted}
                        onChange={(e) => handleCountChange(p.id, e.target.value)}
                        className="w-20 p-1 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-black">
                      {diff === 0 ? (
                        <span className="text-slate-400">Match (0)</span>
                      ) : diff > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">+{diff}</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">{diff}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {variances.length > 0 ? `${variances.length} adjustments will be recorded in audit log.` : 'All counts balanced.'}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition cursor-pointer"
            >
              {loading ? 'Reconciling...' : 'Apply & Reconcile Variances'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
