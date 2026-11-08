import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, History } from 'lucide-react';

export default function StockMovementModal({ products = [], onClose, onSubmit }) {
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [movementType, setMovementType] = useState('IN'); // 'IN' or 'OUT'
  const [quantity, setQuantity] = useState(10);
  const [unitCost, setUnitCost] = useState(products[0]?.unit_cost || 0);
  const [reason, setReason] = useState('Supplier restock delivery');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [performedBy, setPerformedBy] = useState('Operations Staff');
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find(p => p.id === parseInt(productId)) || products[0];

  const handleProductChange = (id) => {
    setProductId(id);
    const prod = products.find(p => p.id === parseInt(id));
    if (prod) {
      setUnitCost(prod.unit_cost);
    }
  };

  const handleTypeChange = (type) => {
    setMovementType(type);
    if (type === 'IN') {
      setReason('Supplier restock delivery');
    } else {
      setReason('Customer order fulfillment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || quantity <= 0) return;

    if (movementType === 'OUT' && selectedProduct && quantity > selectedProduct.quantity_on_hand) {
      alert(`Cannot dispatch ${quantity} units. Only ${selectedProduct.quantity_on_hand} available on hand!`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        product_id: parseInt(productId),
        movement_type: movementType,
        quantity: parseInt(quantity),
        unit_cost: parseFloat(unitCost) || 0.0,
        reason,
        reference_number: referenceNumber || null,
        performed_by: performedBy
      });
      onClose();
    } catch (err) {
      alert('Error recording movement: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Stock Movement</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Movement Type Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('IN')}
              className={`py-2 rounded-lg font-bold flex items-center justify-center transition cursor-pointer ${
                movementType === 'IN' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 mr-1.5" />
              Stock IN (Restock)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('OUT')}
              className={`py-2 rounded-lg font-bold flex items-center justify-center transition cursor-pointer ${
                movementType === 'OUT' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 mr-1.5" />
              Stock OUT (Fulfill)
            </button>
          </div>

          {/* Product Select */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Select Product</label>
            <select
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              required
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) &bull; Stock: {p.quantity_on_hand} {p.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-center"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Unit Valuation ($ Base)</label>
              <input
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Reference # (PO/Inv)</label>
              <input
                type="text"
                placeholder="e.g. PO-8891 or INV-440"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Operator Name</label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Reason / Notes</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
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
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-white font-bold shadow-xs transition cursor-pointer ${
                movementType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              {loading ? 'Recording...' : movementType === 'IN' ? 'Add Stock In' : 'Fulfill Stock Out'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
