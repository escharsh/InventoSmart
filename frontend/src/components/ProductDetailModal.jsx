import React from 'react';
import BarcodeDisplay from './BarcodeDisplay';
import { 
  Package, MapPin, Calendar, Truck, ArrowDownRight, 
  ArrowUpRight, Sliders, DollarSign, Edit3, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductDetailModal({ product, onClose, onEdit, onQuickAdjust }) {
  const { formatCurrency } = useApp();
  if (!product) return null;

  const movements = product.recent_movements || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{product.name}</h3>
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold">{product.sku}</span>
                <span>&bull;</span>
                <span>{product.category_name}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
        </div>

        {/* Top Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Current Stock</span>
            <div className="mt-1 flex items-baseline font-mono">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{product.quantity_on_hand}</span>
              <span className="ml-1 text-slate-500 dark:text-slate-400">{product.unit}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Threshold: min {product.min_reorder_level} | max {product.max_capacity}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Valuation</span>
            <div className="mt-1 font-mono">
              <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(product.selling_price)}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Unit Cost: {formatCurrency(product.unit_cost)}</span>
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              Asset Value: {formatCurrency(product.quantity_on_hand * product.unit_cost)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col justify-center items-center">
            <BarcodeDisplay value={product.barcode || product.sku} height={38} showText={false} />
            <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 mt-1">{product.barcode || product.sku}</span>
          </div>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-y border-slate-100 dark:border-slate-800 py-3">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Warehouse Bin</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
              {product.location}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Supplier</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center mt-0.5">
              <Truck className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
              {product.supplier_name || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Batch Number</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">{product.batch_number || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Expiry Date</span>
            <span className="text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">{product.expiry_date || 'N/A'}</span>
          </div>
        </div>

        {product.description && (
          <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-200 block mb-0.5">Notes & Specs:</span>
            {product.description}
          </div>
        )}

        {/* Recent Stock Movement History */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Recent Stock Transaction History</h4>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {movements.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">No recent transactions recorded.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Change</th>
                    <th className="py-2 px-3">Balance</th>
                    <th className="py-2 px-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {m.created_at.slice(0, 16)}
                      </td>
                      <td className="py-2 px-3 font-bold text-[10px]">
                        {m.movement_type === 'IN' ? (
                          <span className="text-emerald-600 dark:text-emerald-400">+IN</span>
                        ) : m.movement_type === 'OUT' ? (
                          <span className="text-cyan-600 dark:text-cyan-400">-OUT</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">ADJ</span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {m.movement_type === 'IN' ? `+${m.quantity}` : m.movement_type === 'OUT' ? `-${m.quantity}` : m.quantity}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500 dark:text-slate-400">
                        {m.previous_stock} &rarr; <span className="font-bold text-slate-800 dark:text-slate-200">{m.new_stock}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{m.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => {
              onClose();
              onQuickAdjust(product);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Quick Adjust
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              Edit Details
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
