import React, { useState } from 'react';
import { 
  BrainCircuit, Sparkles, TrendingDown, Clock, 
  ShoppingCart, AlertOctagon, CheckCircle2, ArrowRight,
  Layers, DollarSign, RefreshCw, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AiForecastTab({
  forecastData,
  onTriggerAutoReorder,
  onNavigateTab,
  loading
}) {
  const { formatCurrency } = useApp();
  const [subTab, setSubTab] = useState('forecast'); // 'forecast', 'abc', 'deadstock'
  const [generatingPo, setGeneratingPo] = useState(false);
  const [poResult, setPoResult] = useState(null);

  const forecasts = forecastData?.forecasts || [];
  const abcItems = forecastData?.abc_analysis || [];
  const criticalCount = forecastData?.critical_reorder_count || 0;
  const deadStockCount = forecastData?.dead_stock_count || 0;
  const deadStockValue = forecastData?.total_dead_stock_value || 0;

  const handleAutoReorder = async () => {
    try {
      setGeneratingPo(true);
      const res = await onTriggerAutoReorder();
      setPoResult(res);
    } catch (err) {
      alert('Error generating POs: ' + err.message);
    } finally {
      setGeneratingPo(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* AI Header & Metric Callouts */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black">AI Demand & Stock Intelligence</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-400/30">
                  Predictive Engine
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Dynamic burn-rate algorithms, predictive stockout horizons, and automated procurement lot sizing.
              </p>
            </div>
          </div>

          {/* 1-Click Auto Reorder Button */}
          <button
            onClick={handleAutoReorder}
            disabled={generatingPo || criticalCount === 0}
            className={`inline-flex items-center px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 ${
              criticalCount > 0
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {generatingPo ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                <span>Generating Orders...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2 text-yellow-300" />
                <span>1-Click AI Auto-Reorder ({criticalCount} Low Items)</span>
              </>
            )}
          </button>
        </div>

        {/* PO Generation Result Notification */}
        {poResult && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{poResult.message}</span>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-emerald-300 hover:underline flex items-center"
            >
              <span>View Purchase Orders</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}

        {/* AI Stats Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-purple-800/40 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-rose-300 font-bold">{criticalCount} Urgent Items</span>
              <p className="text-[11px] text-purple-200/70">At risk of stockout within 7 days</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-amber-300 font-bold font-mono">{formatCurrency(deadStockValue)} Capital</span>
              <p className="text-[11px] text-purple-200/70">{deadStockCount} stagnant products identified</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-cyan-300 font-bold">EOQ Algorithmic Model</span>
              <p className="text-[11px] text-purple-200/70">Order vs holding cost balanced</p>
            </div>
          </div>
        </div>

      </div>

      {/* View Switcher Sub-tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-bold">
        <button
          onClick={() => setSubTab('forecast')}
          className={`pb-2.5 transition ${
            subTab === 'forecast'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Predictive Reorder Forecast
        </button>
        <button
          onClick={() => setSubTab('abc')}
          className={`pb-2.5 transition ${
            subTab === 'abc'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          ABC Inventory Capital Matrix
        </button>
        <button
          onClick={() => setSubTab('deadstock')}
          className={`pb-2.5 transition ${
            subTab === 'deadstock'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Dead Stock & Slow Movers ({deadStockCount})
        </button>
      </div>

      {/* Subtab 1: Predictive Reorder Table */}
      {subTab === 'forecast' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Depletion Velocity & Reorder Recommendations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Calculated from 30-day historical consumption velocity</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-4">Stock on Hand</th>
                  <th className="py-3 px-4">Daily Burn</th>
                  <th className="py-3 px-4">Days Left</th>
                  <th className="py-3 px-4">Stockout Date</th>
                  <th className="py-3 px-4">EOQ Recommended Batch</th>
                  <th className="py-3 px-4">AI Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {forecasts.map((f) => (
                  <tr key={f.product_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{f.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{f.sku} &bull; {f.supplier_name}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {f.current_stock}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{f.daily_burn_rate}</span> units/day
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {f.days_until_stockout <= 3 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-extrabold flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {f.days_until_stockout} days
                        </span>
                      ) : f.days_until_stockout <= 7 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {f.days_until_stockout} days
                        </span>
                      ) : (
                        <span className="text-slate-600 dark:text-slate-400">
                          {f.days_until_stockout > 365 ? '> 1 year' : `${f.days_until_stockout} days`}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {f.estimated_stockout_date}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                        +{f.recommended_order_quantity} units
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {f.urgency === 'OUT_OF_STOCK' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          STOCKOUT NOW
                        </span>
                      ) : f.urgency === 'CRITICAL_LOW' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          CRITICAL LOW
                        </span>
                      ) : f.urgency === 'WATCH' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800">
                          MONITOR
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          HEALTHY
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: ABC Analysis */}
      {subTab === 'abc' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">Class A (Top ~80% Capital)</span>
                <span className="px-2 py-0.5 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold text-[10px]">Strict Control</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Core capital assets. Requires continuous automated monitoring, priority replenishment, and frequent physical verification.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-900 dark:text-blue-200 text-sm">Class B (Next ~15% Capital)</span>
                <span className="px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-[10px]">Standard Control</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Moderate value products. Standard automated min/max threshold replenishment and periodic reviews.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Class C (Bottom ~5% Capital)</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]">Bulk / Simple</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Low individual value supplies (tape, boxes). Maintain higher buffer stocks to reduce order frequency.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Matrix Tier</th>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Unit Cost</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Total Tied Capital</th>
                    <th className="py-3 px-4">% Share of Portfolio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {abcItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md font-black text-xs ${
                          item.abc_class === 'A' ? 'bg-indigo-600 text-white shadow-xs' :
                          item.abc_class === 'B' ? 'bg-blue-500 text-white shadow-xs' :
                          'bg-slate-500 text-white'
                        }`}>
                          Class {item.abc_class}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{item.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">{formatCurrency(item.unit_cost)}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono">{item.quantity_on_hand}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(item.stock_value)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {item.value_percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Dead Stock */}
      {subTab === 'deadstock' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dead Stock & Stagnant Inventory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Items with 0 outbound dispatches over the past 30 days that hold significant capital commitment.
            </p>
          </div>

          {forecasts.filter(f => f.is_dead_stock).length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-200">No stagnant or dead inventory detected!</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">All products have had recent movement activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {forecasts.filter(f => f.is_dead_stock).map((item) => (
                <div key={item.product_id} className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                      SKU: {item.sku} &bull; {item.current_stock} units on hand &bull; 0 dispatches in 30 days
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-600 dark:text-rose-400 text-sm font-mono">
                      {formatCurrency(item.dead_stock_value)}
                    </span>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Stagnant Capital</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
