import React, { useState, useEffect } from 'react';
import { Package, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductFormModal({
  product = null,
  categories = [],
  suppliers = [],
  onClose,
  onSubmit
}) {
  const { currentCurrency } = useApp();
  const isEditing = Boolean(product && product.id);

  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    description: '',
    category_id: categories[0]?.id || '',
    supplier_id: suppliers[0]?.id || '',
    unit_cost: 0,
    selling_price: 0,
    quantity_on_hand: 0,
    min_reorder_level: 10,
    max_capacity: 500,
    reorder_quantity: 50,
    location: 'Warehouse A - Bin 1',
    unit: 'pcs',
    expiry_date: '',
    batch_number: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        barcode: product.barcode || '',
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || categories[0]?.id || '',
        supplier_id: product.supplier_id || suppliers[0]?.id || '',
        unit_cost: product.unit_cost || 0,
        selling_price: product.selling_price || 0,
        quantity_on_hand: product.quantity_on_hand || 0,
        min_reorder_level: product.min_reorder_level || 10,
        max_capacity: product.max_capacity || 500,
        reorder_quantity: product.reorder_quantity || 50,
        location: product.location || 'Warehouse A - Bin 1',
        unit: product.unit || 'pcs',
        expiry_date: product.expiry_date || '',
        batch_number: product.batch_number || ''
      });
    } else {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setFormData(prev => ({
        ...prev,
        sku: `SKU-${randomId}`,
        barcode: `890${randomId}001`,
        category_id: categories[0]?.id || '',
        supplier_id: suppliers[0]?.id || ''
      }));
    }
  }, [product, categories, suppliers]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
        unit_cost: parseFloat(formData.unit_cost) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        quantity_on_hand: parseInt(formData.quantity_on_hand) || 0,
        min_reorder_level: parseInt(formData.min_reorder_level) || 0,
        max_capacity: parseInt(formData.max_capacity) || 500,
        reorder_quantity: parseInt(formData.reorder_quantity) || 50
      };
      await onSubmit(payload, isEditing ? product.id : null);
      onClose();
    } catch (err) {
      alert('Error saving product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Inventory Item' : 'Register New Inventory Item'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Wireless Ergonomic Mouse"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">SKU Code *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Barcode</label>
              <input
                type="text"
                placeholder="Scan or auto-generated"
                value={formData.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Supplier</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => handleChange('supplier_id', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Unit Purchase Cost ({currentCurrency.symbol} USD Base)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => handleChange('unit_cost', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Selling Retail Price ({currentCurrency.symbol} USD Base)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => handleChange('selling_price', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Measurement Unit</label>
              <input
                type="text"
                placeholder="pcs, box, kg, pack"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Stock Quantities & Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Stock on Hand</label>
              <input
                type="number"
                value={formData.quantity_on_hand}
                onChange={(e) => handleChange('quantity_on_hand', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Min Reorder Level</label>
              <input
                type="number"
                value={formData.min_reorder_level}
                onChange={(e) => handleChange('min_reorder_level', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold text-center"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Reorder Batch Qty</label>
              <input
                type="number"
                value={formData.reorder_quantity}
                onChange={(e) => handleChange('reorder_quantity', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Max Capacity</label>
              <input
                type="number"
                value={formData.max_capacity}
                onChange={(e) => handleChange('max_capacity', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center"
                required
              />
            </div>
          </div>

          {/* Location & Batch */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Storage Location / Aisle</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Batch / Lot Number</label>
              <input
                type="text"
                placeholder="BATCH-2026-X"
                value={formData.batch_number}
                onChange={(e) => handleChange('batch_number', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={formData.expiry_date || ''}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Product Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="Key specifications, dimensions, notes..."
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4 mr-1.5" />
              <span>{loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
