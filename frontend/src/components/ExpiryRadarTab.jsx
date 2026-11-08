import React, { useState, useEffect } from 'react';
import { 
  Hourglass, AlertCircle, CheckCircle2, Clock, 
  Calendar, DollarSign, Filter, RefreshCw, Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchExpiryRadar } from '../api';

export default function ExpiryRadarTab({ onOpenProductModal }) {
  const { formatCurrency } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'EXPIRED', 'EXPIRING_CRITICAL', 'EXPIRING_SOON', 'FRESH'

  const loadRadar = async () => {
    try {
      setLoading(true);
      const data = await fetchExpiryRadar();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRadar();
  }, []);

  const filtered = items.filter(it => {
    if (filterStatus === 'ALL') return true;
    return it.shelf_status === filterStatus;
  });

  const expiredCount = items.filter(i => i.shelf_status === 'EXPIRED').length;
  const criticalCount = items.filter(i => i.shelf_status === 'EXPIRING_CRITICAL').length;
  const totalTiedCapital = items.reduce((acc, it) => acc + (it.quantity_on_hand * it.unit_cost), 0);

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-rose-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
              <Hourglass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">Perishables & Expiration Radar</h2>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Batch shelf-life tracking, automated expiry warnings, and perishable capital protection.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-center font-mono">
              <span className="text-[10px] text-rose-200 block">Critical Shelf Risk</span>
              <span className="text-base font-black text-rose-400">{expiredCount + criticalCount} Batches</span>
            </div>
            <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-center font-mono">
              <span className="text-[10px] text-slate-300 block">Total Monitored Capital</span>
              <span className="text-base font-bold text-white">{formatCurrency(totalTiedCapital)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table Controls */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Perishables' },
            { id: 'EXPIRED', label: `Expired (${expiredCount})`, color: 'text-rose-500' },
            { id: 'EXPIRING_CRITICAL', label: `< 30 Days (${criticalCount})`, color: 'text-amber-500' },
            { id: 'EXPIRING_SOON', label: '< 90 Days' },
            { id: 'FRESH', label: 'Fresh Stock' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 rounded-lg transition ${
                filterStatus === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={tab.color}>{tab.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={loadRadar}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Refresh Radar"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Expiry Items Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Item & Batch #</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Countdown</th>
                <th className="py-3 px-4">Units on Hand</th>
                <th className="py-3 px-4">Tied Capital</th>
                <th className="py-3 px-4">Shelf Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No items matching this shelf status filter.
                  </td>
                </tr>
              ) : (
                filtered.map((it) => {
                  const isExp = it.shelf_status === 'EXPIRED';
                  const isCrit = it.shelf_status === 'EXPIRING_CRITICAL';
                  const isSoon = it.shelf_status === 'EXPIRING_SOON';

                  return (
                    <tr key={it.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{it.name}</div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {it.sku} &bull; Batch: {it.batch_number || 'N/A'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-600 dark:text-slate-300">{it.category_name}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {it.expiry_date}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {isExp ? (
                          <span className="text-rose-600 dark:text-rose-400 font-extrabold">Expired past date</span>
                        ) : isCrit ? (
                          <span className="text-rose-500 font-bold">{it.days_remaining} days left</span>
                        ) : isSoon ? (
                          <span className="text-amber-500 font-semibold">{it.days_remaining} days left</span>
                        ) : (
                          <span className="text-emerald-500">{it.days_remaining} days left</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {it.quantity_on_hand} {it.unit}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(it.quantity_on_hand * it.unit_cost)}
                      </td>

                      <td className="py-3.5 px-4">
                        {isExp ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            EXPIRED
                          </span>
                        ) : isCrit ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                            CRITICAL &lt; 30d
                          </span>
                        ) : isSoon ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            SOON &lt; 90d
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            HEALTHY SHELF
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onOpenProductModal(it)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          Markdown / Edit &rarr;
                        </button>
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
