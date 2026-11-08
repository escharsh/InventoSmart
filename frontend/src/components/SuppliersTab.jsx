import React, { useState } from 'react';
import { Truck, Star, Phone, Mail, MapPin, Plus, DollarSign, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createSupplier } from '../api';

export default function SuppliersTab({
  suppliers = [],
  onRefresh,
  loading
}) {
  const { formatCurrency } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    lead_time_days: 7,
    rating: 4.8
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setSaving(true);
    try {
      await createSupplier({
        ...formData,
        lead_time_days: parseInt(formData.lead_time_days) || 7,
        rating: parseFloat(formData.rating) || 4.5
      });
      setModalOpen(false);
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        lead_time_days: 7,
        rating: 4.8
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error creating supplier: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner & CTA */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Vendor Directory & Procurement Scorecards</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track supplier lead times, delivery ratings, and cumulative purchase spend</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm shadow-indigo-600/20 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Vendor Partner
        </button>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Contact: <strong className="text-slate-700 dark:text-slate-300">{s.contact_person || 'Representative'}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800/60 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{s.rating || 4.5}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-center text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Lead Time</span>
                  <span className="font-bold text-slate-900 dark:text-white">{s.lead_time_days} days</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Products</span>
                  <span className="font-bold text-slate-900 dark:text-white">{s.product_count || 0} SKUs</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Spend</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(s.total_spend || 0)}</span>
                </div>
              </div>

              {/* Contact info */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {s.email && (
                  <div className="flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <a href={`mailto:${s.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 truncate">
                      {s.email}
                    </a>
                  </div>
                )}
                {s.phone && (
                  <div className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span>{s.phone}</span>
                  </div>
                )}
                {s.address && (
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                    <span className="truncate">{s.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <a
                href={`mailto:${s.email}?subject=Inventory Inbound Procurement Order Inquiry`}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Send Vendor RFQ &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add New Supplier Partner</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Tech Ltd"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Lead Time (d)</label>
                  <input
                    type="number"
                    value={formData.lead_time_days}
                    onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Warehouse / Office Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
