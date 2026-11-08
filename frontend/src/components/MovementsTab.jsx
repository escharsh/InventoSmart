import React, { useState } from 'react';
import { 
  ArrowDownRight, ArrowUpRight, Sliders, Plus, 
  Calendar, FileText, User, Filter, RefreshCw
} from 'lucide-react';

export default function MovementsTab({
  movements = [],
  onOpenMovementModal,
  onRefresh,
  loading
}) {
  const [filterType, setFilterType] = useState('ALL');

  const filtered = movements.filter(m => {
    if (filterType === 'ALL') return true;
    return m.movement_type.toUpperCase() === filterType;
  });

  return (
    <div className="space-y-4">
      
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Movement & Audit Trail</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Complete immutable record of all restocks, shipments, and inventory corrections</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Movement Type Filter */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            {['ALL', 'IN', 'OUT', 'ADJUSTMENT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterType === type 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {type === 'ALL' ? 'All Activity' : type}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Refresh Movement Log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenMovementModal}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm shadow-indigo-600/20 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Record Movement
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Quantity Change</th>
                <th className="py-3 px-4">Stock Balance</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Performer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No movement records found for this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const isIn = m.movement_type === 'IN';
                  const isOut = m.movement_type === 'OUT';
                  const isAdj = m.movement_type === 'ADJUSTMENT';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {m.created_at}
                      </td>

                      <td className="py-3.5 px-4">
                        {isIn && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                            STOCK IN
                          </span>
                        )}
                        {isOut && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            STOCK OUT
                          </span>
                        )}
                        {isAdj && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            <Sliders className="w-3 h-3 mr-1" />
                            ADJUST
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{m.product_name}</div>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{m.product_sku}</div>
                      </td>

                      <td className="py-3.5 px-4 font-bold font-mono">
                        <span className={isIn ? 'text-emerald-600 dark:text-emerald-400' : isOut ? 'text-cyan-600 dark:text-cyan-400' : 'text-amber-600 dark:text-amber-400'}>
                          {isIn ? `+${m.quantity}` : isOut ? `-${m.quantity}` : m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.product_unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        <span className="text-slate-400 dark:text-slate-500">{m.previous_stock}</span> &rarr; <span className="font-bold text-slate-900 dark:text-white">{m.new_stock}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={m.reason}>
                        {m.reason || 'Inventory operation'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {m.reference_number || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400 font-medium">
                        {m.performed_by || 'Admin'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
