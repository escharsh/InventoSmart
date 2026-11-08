import React from 'react';
import { 
  Search, Plus, Sliders, MapPin, Barcode, Eye, Edit3, Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductsTab({
  products = [],
  categories = [],
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  stockFilter,
  setStockFilter,
  onOpenProductModal,
  onOpenQuickAdjust,
  onOpenBarcodeModal,
  onViewProductDetail,
  onDeleteProduct
}) {
  const { formatCurrency } = useApp();

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Action Bar */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search input with keyboard hint */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, Barcode, Item Name, or Bin Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-12 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
            /
          </kbd>
        </div>

        {/* Filters and CTA */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-medium"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status filter buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                stockFilter === 'all' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                stockFilter === 'low' 
                  ? 'bg-amber-500 text-white shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                stockFilter === 'out' 
                  ? 'bg-rose-500 text-white shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Out of Stock
            </button>
          </div>

          {/* Add Product Button */}
          <button
            onClick={() => onOpenProductModal(null)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm shadow-indigo-600/20 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Product
          </button>
        </div>

      </div>

      {/* Products Table Card */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price / Cost</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400 dark:text-slate-500">
                    No products found matching your search or filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const stock = p.quantity_on_hand;
                  const min = p.min_reorder_level;
                  const max = p.max_capacity || 200;
                  const pct = Math.min(100, Math.round((stock / max) * 100));

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition group">
                      
                      {/* Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {p.name}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold">
                            {p.sku}
                          </span>
                          {p.barcode && (
                            <button
                              onClick={() => onOpenBarcodeModal(p)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center text-[11px] transition"
                              title="Click to view/print barcode"
                            >
                              <Barcode className="w-3.5 h-3.5 mr-0.5" />
                              <span className="font-mono">{p.barcode}</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${p.category_color || '#3B82F6'}18`,
                            color: p.category_color || '#3B82F6'
                          }}
                        >
                          {p.category_name || 'General'}
                        </span>
                      </td>

                      {/* Cost / Retail Price with Currency Conversion */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-slate-900 dark:text-white font-bold">{formatCurrency(p.selling_price)}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">Cost: {formatCurrency(p.unit_cost)}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-1 shrink-0" />
                          <span className="truncate max-w-[120px]">{p.location || 'Aisle 1'}</span>
                        </div>
                      </td>

                      {/* Stock Level Progress */}
                      <td className="py-3.5 px-4 min-w-[130px]">
                        <div className="flex items-baseline justify-between mb-1 font-mono">
                          <span className="font-black text-slate-900 dark:text-white">{stock} {p.unit}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">min {min}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              stock === 0 ? 'bg-rose-500' :
                              stock <= min ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(5, pct)}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {stock === 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                            Out of Stock
                          </span>
                        ) : stock <= min ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            Optimal
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          
                          {/* Quick Adjust Button */}
                          <button
                            onClick={() => onOpenQuickAdjust(p)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                            title="Quick Stock Adjustment (+/-)"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          {/* Barcode Modal Button */}
                          <button
                            onClick={() => onOpenBarcodeModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Show Printable Barcode"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>

                          {/* Detail Button */}
                          <button
                            onClick={() => onViewProductDetail(p.id)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Product Details & Movement Log"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => onOpenProductModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => onDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
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
