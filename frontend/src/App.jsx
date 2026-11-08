import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import DashboardTab from './components/DashboardTab';
import ProductsTab from './components/ProductsTab';
import AiForecastTab from './components/AiForecastTab';
import MovementsTab from './components/MovementsTab';
import PurchaseOrdersTab from './components/PurchaseOrdersTab';
import SalesOrdersTab from './components/SalesOrdersTab';
import ExpiryRadarTab from './components/ExpiryRadarTab';
import WarehouseVisualizerTab from './components/WarehouseVisualizerTab';
import SuppliersTab from './components/SuppliersTab';

import ProductFormModal from './components/ProductFormModal';
import QuickAdjustModal from './components/QuickAdjustModal';
import BarcodeModal from './components/BarcodeModal';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import StockMovementModal from './components/StockMovementModal';
import ProductDetailModal from './components/ProductDetailModal';
import AuditCountModal from './components/AuditCountModal';
import BulkImportModal from './components/BulkImportModal';

import {
  fetchStats,
  fetchCharts,
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  quickAdjustStock,
  fetchMovements,
  recordMovement,
  fetchAiForecasts,
  triggerAutoReorder,
  fetchPurchaseOrders,
  receivePurchaseOrder,
  createPurchaseOrder,
  fetchCategories,
  fetchSuppliers,
  resetDemoData,
  fetchNotifications,
  fetchSalesOrders,
  fetchSalesOrderById,
  createSalesOrder
} from './api';

function MainApp() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Core Data State
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [movements, setMovements] = useState([]);
  const [aiForecasts, setAiForecasts] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  // Modal States
  const [productModal, setProductModal] = useState({ open: false, product: null });
  const [quickAdjustModal, setQuickAdjustModal] = useState({ open: false, product: null });
  const [barcodeModal, setBarcodeModal] = useState({ open: false, product: null });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, product: null });
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  // Initial Data Load
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        chartsRes,
        categoriesRes,
        suppliersRes,
        ordersRes,
        salesRes,
        notifRes
      ] = await Promise.all([
        fetchStats(),
        fetchCharts(),
        fetchCategories(),
        fetchSuppliers(),
        fetchPurchaseOrders(),
        fetchSalesOrders(),
        fetchNotifications()
      ]);

      setStats(statsRes);
      setCharts(chartsRes);
      setCategories(categoriesRes);
      setSuppliers(suppliersRes);
      setPurchaseOrders(ordersRes);
      setSalesOrders(salesRes);
      setNotifications(notifRes);

      await reloadProducts();
      await reloadMovements();
      const aiRes = await fetchAiForecasts();
      setAiForecasts(aiRes);

    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const reloadProducts = async () => {
    const prods = await fetchProducts({
      search: searchTerm,
      category_id: selectedCategory,
      stock_status: stockFilter
    });
    setProducts(prods);
  };

  const reloadMovements = async () => {
    const movs = await fetchMovements();
    setMovements(movs);
  };

  const reloadSuppliers = async () => {
    const sups = await fetchSuppliers();
    setSuppliers(sups);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter reloads
  useEffect(() => {
    reloadProducts();
  }, [searchTerm, selectedCategory, stockFilter]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setScannerOpen(prev => !prev);
      }
      if (e.key === '/') {
        e.preventDefault();
        setCurrentTab('products');
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Product Save
  const handleSaveProduct = async (formData, id) => {
    if (id) {
      await updateProduct(id, formData);
    } else {
      await createProduct(formData);
    }
    await loadAllData();
  };

  // Handle Product Delete
  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will permanently remove its inventory records.`)) return;
    await deleteProduct(id);
    await loadAllData();
  };

  // Handle Quick Adjust
  const handleSaveQuickAdjust = async (id, adjustment, reason) => {
    await quickAdjustStock(id, adjustment, reason);
    await loadAllData();
  };

  // Handle Stock Movement Record
  const handleRecordMovement = async (movData) => {
    await recordMovement(movData);
    await loadAllData();
  };

  // Handle Auto Reorder Trigger
  const handleTriggerAutoReorder = async () => {
    const res = await triggerAutoReorder();
    await loadAllData();
    return res;
  };

  // Handle PO Receipt
  const handleReceivePO = async (poId) => {
    const res = await receivePurchaseOrder(poId);
    await loadAllData();
    return res;
  };

  // Handle PO Creation
  const handleCreatePO = async (poData) => {
    const res = await createPurchaseOrder(poData);
    await loadAllData();
    return res;
  };

  // Handle Sales Order Creation
  const handleCreateSalesOrder = async (orderData) => {
    const res = await createSalesOrder(orderData);
    await loadAllData();
    return res;
  };

  // View Deep Product Details
  const handleViewProductDetail = async (id) => {
    const prod = await fetchProductById(id);
    setDetailModal({ open: true, product: prod });
  };

  // View Invoice Detail
  const handleViewInvoice = async (id) => {
    return await fetchSalesOrderById(id);
  };

  // Filter by Warehouse Location from visualizer
  const handleFilterByLocation = (loc) => {
    setSearchTerm(loc);
    setCurrentTab('products');
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (!confirm('Reset database with demo sample records? Any newly added items will be replaced.')) return;
    await resetDemoData();
    await loadAllData();
    alert('Demo inventory reset successfully!');
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open('/api/export/csv', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        stats={stats}
        notifications={notifications}
        onOpenScanner={() => setScannerOpen(true)}
        onResetDemo={handleResetDemo}
        onExportCsv={handleExportCsv}
        onOpenAuditModal={() => setAuditModalOpen(true)}
        onOpenBulkImport={() => setBulkImportOpen(true)}
        loading={loading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardTab
            stats={stats}
            charts={charts}
            onNavigateTab={setCurrentTab}
            onOpenProductModal={() => setProductModal({ open: true, product: null })}
            onOpenMovementModal={() => setMovementModalOpen(true)}
          />
        )}

        {currentTab === 'products' && (
          <ProductsTab
            products={products}
            categories={categories}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            stockFilter={stockFilter}
            setStockFilter={setStockFilter}
            onOpenProductModal={(p) => setProductModal({ open: true, product: p })}
            onOpenQuickAdjust={(p) => setQuickAdjustModal({ open: true, product: p })}
            onOpenBarcodeModal={(p) => setBarcodeModal({ open: true, product: p })}
            onViewProductDetail={handleViewProductDetail}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {currentTab === 'sales' && (
          <SalesOrdersTab
            salesOrders={salesOrders}
            products={products}
            onCreateSalesOrder={handleCreateSalesOrder}
            onViewInvoice={handleViewInvoice}
            loading={loading}
          />
        )}

        {currentTab === 'ai-forecast' && (
          <AiForecastTab
            forecastData={aiForecasts}
            onTriggerAutoReorder={handleTriggerAutoReorder}
            onNavigateTab={setCurrentTab}
            loading={loading}
          />
        )}

        {currentTab === 'expiry' && (
          <ExpiryRadarTab
            onOpenProductModal={(p) => setProductModal({ open: true, product: p })}
          />
        )}

        {currentTab === 'warehouse' && (
          <WarehouseVisualizerTab
            onFilterByLocation={handleFilterByLocation}
          />
        )}

        {currentTab === 'movements' && (
          <MovementsTab
            movements={movements}
            onOpenMovementModal={() => setMovementModalOpen(true)}
            onRefresh={reloadMovements}
            loading={loading}
          />
        )}

        {currentTab === 'orders' && (
          <PurchaseOrdersTab
            purchaseOrders={purchaseOrders}
            suppliers={suppliers}
            products={products}
            onReceivePO={handleReceivePO}
            onCreatePO={handleCreatePO}
            loading={loading}
          />
        )}

        {currentTab === 'suppliers' && (
          <SuppliersTab
            suppliers={suppliers}
            onRefresh={reloadSuppliers}
            loading={loading}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      {productModal.open && (
        <ProductFormModal
          product={productModal.product}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setProductModal({ open: false, product: null })}
          onSubmit={handleSaveProduct}
        />
      )}

      {quickAdjustModal.open && (
        <QuickAdjustModal
          product={quickAdjustModal.product}
          onClose={() => setQuickAdjustModal({ open: false, product: null })}
          onSave={handleSaveQuickAdjust}
        />
      )}

      {barcodeModal.open && (
        <BarcodeModal
          product={barcodeModal.product}
          onClose={() => setBarcodeModal({ open: false, product: null })}
        />
      )}

      {scannerOpen && (
        <BarcodeScannerModal
          onClose={() => setScannerOpen(false)}
          onStockUpdated={loadAllData}
        />
      )}

      {movementModalOpen && (
        <StockMovementModal
          products={products}
          onClose={() => setMovementModalOpen(false)}
          onSubmit={handleRecordMovement}
        />
      )}

      {detailModal.open && (
        <ProductDetailModal
          product={detailModal.product}
          onClose={() => setDetailModal({ open: false, product: null })}
          onEdit={(p) => setProductModal({ open: true, product: p })}
          onQuickAdjust={(p) => setQuickAdjustModal({ open: true, product: p })}
        />
      )}

      {auditModalOpen && (
        <AuditCountModal
          products={products}
          onClose={() => setAuditModalOpen(false)}
          onReconciled={loadAllData}
        />
      )}

      {bulkImportOpen && (
        <BulkImportModal
          onClose={() => setBulkImportOpen(false)}
          onImportSuccess={loadAllData}
        />
      )}

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        InventoSmart AI &bull; Smart Inventory Management System &bull; SQLite &bull; FastAPI &bull; React &bull; Tailwind CSS
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
