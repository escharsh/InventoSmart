import React, { useState } from 'react';
import { 
  ShoppingCart, Plus, PackageCheck, Clock, CheckCircle2, 
  Calendar, Truck, DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PurchaseOrdersTab({
  purchaseOrders = [],
  suppliers = [],
  products = [],
  onReceivePO,
  onCreatePO,
  loading
}) {
  const { formatCurrency, currentCurrency } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [receivingId, setReceivingId] = useState(null);

  // Form state for creating a new PO
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [items, setItems] = useState([
    { product_id: products[0]?.id || '', quantity: 20, unit_cost: products[0]?.unit_cost || 10 }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { product_id: products[0]?.id || '', quantity: 10, unit_cost: products[0]?.unit_cost || 10 }
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'product_id') {
      const prod = products.find(p => p.id === parseInt(value));
      if (prod) {
        updated[index].unit_cost = prod.unit_cost;
      }
    }
    setItems(updated);
  };

  const handleSubmitPO = async (e) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) return;

    await onCreatePO({
      supplier_id: parseInt(supplierId),
      notes,
      expected_date: expectedDate || null,
      items: items.map(it => ({
        product_id: parseInt(it.product_id),
        quantity: parseInt(it.quantity),
        unit_cost: parseFloat(it.unit_cost)
      }))
    });

    setShowCreateModal(false);
    setNotes('');
    setExpectedDate('');
  };

  const handleReceive = async (poId) => {
    if (!confirm('Receive this Purchase Order and automatically add items into warehouse inventory stock?')) return;
    try {
      setReceivingId(poId);
      await onReceivePO(poId);
    } catch (err) {
      alert('Error receiving PO: ' + err.message);
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Procurement & Purchase Orders</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track vendor shipments, lead times, and automate inbound stock receipt</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm shadow-indigo-600/20 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Purchase Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Expected Delivery</th>
                <th className="py-3 px-4">SKU Count</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No purchase orders recorded yet. Use the button above or AI Auto-Reorder to create one.
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => {
                  const isReceived = po.status === 'RECEIVED';
                  const isPending = po.status === 'PENDING' || po.status === 'ORDERED';

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {po.po_number}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{po.supplier_name || 'Vendor'}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">{po.notes || 'Standard Order'}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {po.expected_date ? (
                          <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
                            <span>{po.expected_date}</span>
                          </div>
                        ) : 'Not specified'}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {po.item_count || 1} SKU types
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(po.total_amount)}
                      </td>

                      <td className="py-3.5 px-4">
                        {isReceived ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            RECEIVED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            <Clock className="w-3 h-3 mr-1" />
                            {po.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <button
                            onClick={() => handleReceive(po.id)}
                            disabled={receivingId === po.id}
                            className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm shadow-emerald-600/20 cursor-pointer"
                            title="Receive goods and auto-increase stock"
                          >
                            <PackageCheck className="w-3.5 h-3.5 mr-1" />
                            <span>{receivingId === po.id ? 'Processing...' : 'Receive Stock'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium italic">
                            Completed & In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Draft New Purchase Order</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitPO} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Select Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  required
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.lead_time_days} days lead)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Order Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Expedited shipping requested"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Order Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <select
                        value={it.product_id}
                        onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                        className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        required
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>

                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={it.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-bold"
                          required
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Cost $"
                          value={it.unit_cost}
                          onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-right font-mono"
                          required
                        />
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 font-bold cursor-pointer"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Submit Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
