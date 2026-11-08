import React, { useState, useRef, useEffect } from 'react';
import { 
  Boxes, LayoutDashboard, BrainCircuit, History, 
  ShoppingCart, Scan, Download, RotateCcw, Moon, Sun,
  ChevronDown, Check, Globe, Bell, Receipt, Hourglass, 
  Layers, Truck, UploadCloud, ClipboardCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  stats, 
  notifications = [],
  onOpenScanner, 
  onResetDemo, 
  onExportCsv,
  onOpenAuditModal,
  onOpenBulkImport,
  loading 
}) {
  const { theme, toggleTheme, isDark, currencyCode, setCurrencyCode, CURRENCIES } = useApp();
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const currencyRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { 
      id: 'products', 
      label: 'Inventory Catalog', 
      icon: Boxes, 
      badge: stats?.low_stock_count > 0 ? `${stats.low_stock_count} Low` : null,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20'
    },
    { 
      id: 'sales', 
      label: 'Sales & Invoicing (POS)', 
      icon: Receipt,
      badge: stats?.completed_sales_orders > 0 ? `${stats.completed_sales_orders}` : null,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20'
    },
    { 
      id: 'ai-forecast', 
      label: 'AI & Demand EOQ', 
      icon: BrainCircuit,
      badge: stats?.out_of_stock_count > 0 ? `${stats.out_of_stock_count} Alert` : 'AI',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-500/20'
    },
    { id: 'expiry', label: 'Perishables Radar', icon: Hourglass },
    { id: 'warehouse', label: 'Rack & Bin Map', icon: Layers },
    { id: 'movements', label: 'Audit Trail', icon: History },
    { 
      id: 'orders', 
      label: 'Purchase Orders', 
      icon: ShoppingCart,
      badge: stats?.pending_purchase_orders > 0 ? `${stats.pending_purchase_orders} Pending` : null,
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20'
    },
    { id: 'suppliers', label: 'Vendors', icon: Truck }
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Invento<span className="text-indigo-600 dark:text-indigo-400">Smart</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  Enterprise AI
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Live &bull; Real-Time Inventory Control</span>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            
            {/* Cycle Count / Stock Take */}
            <button
              onClick={onOpenAuditModal}
              className="hidden xl:inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Physical Cycle Count / Stock Take"
            >
              <ClipboardCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              <span>Stock Take</span>
            </button>

            {/* Bulk CSV Import */}
            <button
              onClick={onOpenBulkImport}
              className="hidden lg:inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Bulk Import CSV Products"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
              <span>Bulk Import</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="System Notifications & Alerts"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              <NotificationDrawer
                notifications={notifications}
                open={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onNavigateTab={setCurrentTab}
              />
            </div>

            {/* Currency Selector Dropdown */}
            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Change Display Currency"
              >
                <span>{CURRENCIES[currencyCode]?.flag}</span>
                <span className="font-mono">{currencyCode}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>

              {currencyMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700/60">
                    Select Currency
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {Object.values(CURRENCIES).map((curr) => {
                      const isSelected = curr.code === currencyCode;
                      return (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setCurrencyCode(curr.code);
                            setCurrencyMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer ${
                            isSelected ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{curr.flag}</span>
                            <span>{curr.code}</span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">({curr.symbol})</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-90" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 transition-transform -rotate-12 hover:rotate-0" />
              )}
            </button>

            {/* Barcode Scanner Button */}
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer"
              title="Quick Barcode Scanner (Press B)"
            >
              <Scan className="w-3.5 h-3.5 mr-1.5 text-indigo-300 dark:text-white" />
              <span>Scan Barcode</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCsv}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Export CSV Catalog"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>

            {/* Demo Reset */}
            <button
              onClick={onResetDemo}
              disabled={loading}
              className="hidden lg:inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Reset Sample Demo Data"
            >
              <RotateCcw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              <span>Reset</span>
            </button>

          </div>
        </div>

        {/* Tab Navigation Row */}
        <nav className="flex space-x-1 overflow-x-auto pb-1.5 scrollbar-none border-t border-slate-100 dark:border-slate-800/80 pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 mr-2 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
