import React from 'react';
import { 
  DollarSign, PackageCheck, AlertCircle, TrendingUp, 
  ArrowDownRight, ArrowUpRight, ShieldAlert, Sparkles, Plus,
  Layers, ChevronRight, BarChart3, Clock, Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { useApp } from '../context/AppContext';

export default function DashboardTab({ 
  stats, 
  charts, 
  onNavigateTab, 
  onOpenProductModal, 
  onOpenMovementModal 
}) {
  const { formatCurrency, isDark, currencyCode } = useApp();

  if (!stats) {
    return (
      <div className="p-16 text-center text-slate-400 dark:text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs font-medium">Aggregating live inventory telemetry...</p>
      </div>
    );
  }

  const movementData = charts?.movement_trend_14d || [];
  const categoryData = charts?.category_distribution || [];
  const topProducts = charts?.top_value_products || [];

  const pieColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6">
      
      {/* High-Impact Alert Banner if low stock or out of stock */}
      {(stats.low_stock_count > 0 || stats.out_of_stock_count > 0) && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Attention Required: {stats.out_of_stock_count} Out-of-Stock & {stats.low_stock_count} Low-Stock SKUs
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Priority
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Predictive burn rates show impending stockouts. Review AI recommended replenishment orders.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onNavigateTab('ai-forecast')}
              className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm shadow-amber-600/20"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-200" />
              <span>Review AI Forecast</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Valuation */}
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Stock Valuation
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {formatCurrency(stats.total_inventory_value)}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center mr-1.5">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              +{stats.projected_margin_pct}% Margin
            </span>
            <span>({formatCurrency(stats.potential_profit)} Est. Profit)</span>
          </div>
        </div>

        {/* Card 2: Units In Stock */}
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Units On Hand
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {Number(stats.total_units || 0).toLocaleString()}
            </span>
            <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">units</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Representing <span className="font-semibold text-slate-700 dark:text-slate-200">{stats.total_products} unique SKUs</span>
          </div>
        </div>

        {/* Card 3: Stock Health */}
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Threshold Warnings
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-3 font-mono">
            <div>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.low_stock_count}</span>
              <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">Low</span>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.out_of_stock_count}</span>
              <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">Out</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Critical alerts flagged</span>
            <button 
              onClick={() => onNavigateTab('products')} 
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Inspect items &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Daily Movements */}
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Movement
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-3 font-mono">
            <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
              <ArrowDownRight className="w-4 h-4 mr-0.5" />
              <span className="text-xl">+{stats.today_units_in}</span>
              <span className="text-[10px] text-slate-400 ml-1">in</span>
            </div>
            <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold border-l border-slate-200 dark:border-slate-700 pl-3">
              <ArrowUpRight className="w-4 h-4 mr-0.5" />
              <span className="text-xl">-{stats.today_units_out}</span>
              <span className="text-[10px] text-slate-400 ml-1">out</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{stats.today_movements_count} transactions</span>
            <button 
              onClick={onOpenMovementModal}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              + Record &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Main Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: 14-day stock flow trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Velocity Analysis</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">14-day Inbound Restocks vs Outbound Order Dispatches</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1.5"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Inbound (Units In)</span>
              </div>
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mr-1.5"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Outbound (Fulfillment)</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={movementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="label" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#1e293b',
                    borderColor: isDark ? '#334155' : '#475569',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="inbound" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" name="Units In" />
                <Area type="monotone" dataKey="outbound" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" name="Units Out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Category Distribution */}
        <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Capital Share by Category</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Asset valuation distribution across categories</p>

            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total_value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#1e293b', 
                      borderRadius: '12px', 
                      color: '#fff', 
                      fontSize: '12px',
                      border: isDark ? '1px solid #334155' : 'none'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
            {categoryData.slice(0, 4).map((c) => (
              <div key={c.category_id} className="flex items-center justify-between text-xs">
                <div className="flex items-center truncate max-w-[150px]">
                  <span className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600 dark:text-slate-300 truncate">{c.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(c.total_value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Section: Top Value Items & Quick Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Valuation Items */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Inventory Capital Assets</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Products with highest total tied-up inventory value</p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Catalog &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {topProducts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</h5>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{p.sku}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{formatCurrency(p.value)}</span>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">Total Asset Value</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Dispatch & Operations Box */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-6 rounded-2xl shadow-lg border border-indigo-900/40 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-bold mb-3 border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-300" />
              Quick Warehouse Actions
            </div>
            <h3 className="text-base font-black">Fast Inventory Transactions</h3>
            <p className="text-xs text-indigo-200/80 mt-1.5 leading-relaxed">
              Log supplier receipt shipments, fulfill outbound customer dispatch orders, or register a newly acquired SKU item into warehouse bins.
            </p>
          </div>

          <div className="space-y-2 mt-6">
            <button
              onClick={onOpenMovementModal}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition flex items-center justify-center cursor-pointer"
            >
              <ArrowDownRight className="w-4 h-4 mr-1.5" />
              Record Inbound / Outbound Movement
            </button>
            <button
              onClick={onOpenProductModal}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 transition flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add New Inventory Item
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
