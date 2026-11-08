import React, { useState, useEffect } from 'react';
import { Layers, MapPin, Package, RefreshCw, BarChart2, ArrowRight } from 'lucide-react';
import { fetchWarehouseLayout } from '../api';

export default function WarehouseVisualizerTab({ onFilterByLocation }) {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLayout = async () => {
    try {
      setLoading(true);
      const data = await fetchWarehouseLayout();
      setBins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLayout();
  }, []);

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Warehouse Spatial Rack & Bin Map</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time bin occupancy, shelf distribution, and slot allocation</p>
          </div>
        </div>

        <button
          onClick={loadLayout}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Refresh Warehouse Layout"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid of Warehouse Bins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {bins.map((bin, idx) => {
          const occ = bin.occupancy_pct;
          const isHigh = occ >= 80;
          const isMid = occ >= 40 && occ < 80;

          return (
            <div
              key={idx}
              onClick={() => onFilterByLocation(bin.location)}
              className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {bin.location}
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isHigh ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    isMid ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {occ}% Full
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between font-mono">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {bin.total_units} <span className="text-xs font-normal text-slate-400">units</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {bin.product_count} SKU types
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isHigh ? 'bg-amber-500' : isMid ? 'bg-indigo-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(8, occ)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                <span>View Products Here</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
