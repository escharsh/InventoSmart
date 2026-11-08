import React, { useState } from 'react';
import { 
  Receipt, Plus, Printer, CheckCircle2, ShoppingBag, 
  User, DollarSign, Calendar, Eye, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import BarcodeDisplay from './BarcodeDisplay';

export default function SalesOrdersTab({
  salesOrders = [],
  products = [],
  onCreateSalesOrder,
  onViewInvoice,
  loading
}) {
  const { formatCurrency, currentCurrency } = useApp();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(0.08); // 8%
  const [orderItems, setOrderItems] = useState([
    { product_id: products[0]?.id || '', quantity: 1, unit_price: products[0]?.selling_price || 0 }
  ]);

  const handleAddItem = () => {
    const defaultProd = products[0];
    setOrderItems([
      ...orderItems,
      { product_id: defaultProd?.id || '', quantity: 1, unit_price: defaultProd?.selling_price || 0 }
    ]);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    if (field === 'product_id') {
      const prod = products.find(p => p.id === parseInt(value));
      if (prod) {
        updated[index].unit_price = prod.selling_price;
      }
    }
    setOrderItems(updated);
  };

  // Subtotal & Total calculations
  const subtotal = orderItems.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
  const taxAmount = subtotal * taxRate;
  const grandTotal = Math.max(0, subtotal + taxAmount - Number(discountAmount || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || orderItems.length === 0) return;

    try {
      const res = await onCreateSalesOrder({
        customer_name: customerName,
        customer_email: customerEmail || null,
        payment_method: paymentMethod,
        notes: notes || null,
        discount_amount: parseFloat(discountAmount) || 0,
        tax_rate: parseFloat(taxRate) || 0,
        items: orderItems.map(it => ({
          product_id: parseInt(it.product_id),
          quantity: parseInt(it.quantity),
          unit_price: parseFloat(it.unit_price)
        }))
      });

      setCreateModalOpen(false);
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setNotes('');
      setDiscountAmount(0);
      alert('Order fulfilled! Inventory stock updated and Invoice generated.');
    } catch (err) {
      alert('Error creating sales order: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header & Actions */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Customer Sales & Order Invoicing (POS)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Process outbound dispatches, generate printable customer tax invoices, and track revenue</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm shadow-indigo-600/20 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Customer Order / POS Dispatch
        </button>
      </div>

      {/* Sales Orders List Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Units Dispatched</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {salesOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400 dark:text-slate-500">
                    No sales orders logged yet. Click "+ New Customer Order" above to process an outbound sale.
                  </td>
                </tr>
              ) : (
                salesOrders.map((so) => (
                  <tr key={so.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {so.order_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{so.customer_name}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">{so.customer_email || 'Walk-in Customer'}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {so.created_at ? so.created_at.slice(0, 16) : 'Today'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {so.total_units_sold || 1} units ({so.item_count} items)
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {so.payment_method || 'Credit Card'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">
                      {formatCurrency(so.total_amount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {so.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={async () => {
                          const detailed = await onViewInvoice(so.id);
                          setSelectedInvoice(detailed);
                        }}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        title="View & Print Official Invoice"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Customer Order Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Customer Sales Order (POS)</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Global Logistics or John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Customer Email</label>
                  <input
                    type="email"
                    placeholder="billing@customer.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Wire / ACH">Bank Wire / ACH</option>
                    <option value="Cash / POS">Cash / Counter</option>
                    <option value="Net 30 Invoice">Net 30 Terms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Order Notes / Purchase Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. Client PO-9912"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Order Cart Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Order Dispatched Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                  >
                    + Add Product
                  </button>
                </div>

                <div className="space-y-2">
                  {orderItems.map((it, idx) => {
                    const prod = products.find(p => p.id === parseInt(it.product_id));
                    const maxAvailable = prod?.quantity_on_hand || 0;

                    return (
                      <div key={idx} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex-1">
                          <select
                            value={it.product_id}
                            onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            required
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.quantity_on_hand <= 0}>
                                {p.name} ({p.sku}) &bull; Stock: {p.quantity_on_hand} {p.unit}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            min="1"
                            max={maxAvailable}
                            placeholder="Qty"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-bold font-mono"
                            required
                          />
                        </div>

                        <div className="w-28">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            value={it.unit_price}
                            onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-right font-mono"
                            required
                          />
                        </div>

                        {orderItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1 font-bold cursor-pointer"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Financial Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated Tax (8%):</span>
                  <span>+{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Confirm & Fulfill Order
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto print:m-0 print:p-0 print:border-none print:shadow-none">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Customer Invoice</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  Print / PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5">
              
              {/* Header with Barcode */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">TAX INVOICE</h2>
                  <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                    {selectedInvoice.order_number}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Date: {selectedInvoice.created_at ? selectedInvoice.created_at.slice(0, 10) : 'Today'}
                  </p>
                </div>
                <div className="text-right">
                  <BarcodeDisplay value={selectedInvoice.order_number} height={36} showText={false} />
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{selectedInvoice.payment_method}</span>
                </div>
              </div>

              {/* Customer Box */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Billed & Dispatched To:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedInvoice.customer_name}</span>
                {selectedInvoice.customer_email && (
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{selectedInvoice.customer_email}</span>
                )}
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800/80">
                    {(selectedInvoice.items || []).map((it, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 dark:text-white block">{it.product_name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{it.product_sku}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(it.unit_price)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(it.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-56 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax:</span>
                    <span>+{formatCurrency(selectedInvoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1.5">
                    <span>Total Paid:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">
                      {formatCurrency(selectedInvoice.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-700">
                Thank you for your business! &bull; InventoSmart Outbound Dispatch Order
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
