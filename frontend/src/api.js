const BASE_URL = '/api';

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchCharts() {
  const res = await fetch(`${BASE_URL}/dashboard/charts`);
  if (!res.ok) throw new Error('Failed to fetch charts');
  return res.json();
}

export async function fetchNotifications() {
  const res = await fetch(`${BASE_URL}/notifications`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category_id) params.append('category_id', filters.category_id);
  if (filters.stock_status && filters.stock_status !== 'all') {
    params.append('stock_status', filters.stock_status);
  }
  const res = await fetch(`${BASE_URL}/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product details');
  return res.json();
}

export async function createProduct(data) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id, data) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to update product');
  }
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function quickAdjustStock(id, adjustment, reason) {
  const res = await fetch(`${BASE_URL}/products/${id}/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adjustment, reason, performed_by: 'Staff Admin' })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to adjust stock');
  }
  return res.json();
}

export async function fetchMovements(type = null) {
  const url = type ? `${BASE_URL}/movements?movement_type=${type}` : `${BASE_URL}/movements`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch movements');
  return res.json();
}

export async function recordMovement(data) {
  const res = await fetch(`${BASE_URL}/movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to record movement');
  }
  return res.json();
}

export async function fetchAiForecasts() {
  const res = await fetch(`${BASE_URL}/ai/forecasts`);
  if (!res.ok) throw new Error('Failed to fetch AI forecasts');
  return res.json();
}

export async function triggerAutoReorder() {
  const res = await fetch(`${BASE_URL}/ai/auto-reorder-po`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to auto-generate POs');
  return res.json();
}

export async function fetchPurchaseOrders() {
  const res = await fetch(`${BASE_URL}/purchase-orders`);
  if (!res.ok) throw new Error('Failed to fetch purchase orders');
  return res.json();
}

export async function receivePurchaseOrder(id) {
  const res = await fetch(`${BASE_URL}/purchase-orders/${id}/receive`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to receive purchase order');
  }
  return res.json();
}

export async function createPurchaseOrder(data) {
  const res = await fetch(`${BASE_URL}/purchase-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create purchase order');
  return res.json();
}

export async function fetchSalesOrders() {
  const res = await fetch(`${BASE_URL}/sales-orders`);
  if (!res.ok) throw new Error('Failed to fetch sales orders');
  return res.json();
}

export async function fetchSalesOrderById(id) {
  const res = await fetch(`${BASE_URL}/sales-orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch invoice details');
  return res.json();
}

export async function createSalesOrder(data) {
  const res = await fetch(`${BASE_URL}/sales-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to process sales order');
  }
  return res.json();
}

export async function fetchExpiryRadar() {
  const res = await fetch(`${BASE_URL}/inventory/expiry-radar`);
  if (!res.ok) throw new Error('Failed to fetch expiry radar');
  return res.json();
}

export async function fetchWarehouseLayout() {
  const res = await fetch(`${BASE_URL}/warehouse/layout`);
  if (!res.ok) throw new Error('Failed to fetch warehouse layout');
  return res.json();
}

export async function reconcileAudit(data) {
  const res = await fetch(`${BASE_URL}/audit/reconcile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to reconcile audit counts');
  return res.json();
}

export async function bulkImportProducts(items) {
  const res = await fetch(`${BASE_URL}/products/bulk-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items)
  });
  if (!res.ok) throw new Error('Failed to bulk import products');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchSuppliers() {
  const res = await fetch(`${BASE_URL}/suppliers`);
  if (!res.ok) throw new Error('Failed to fetch suppliers');
  return res.json();
}

export async function createSupplier(data) {
  const res = await fetch(`${BASE_URL}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create supplier');
  return res.json();
}

export async function lookupBarcode(code) {
  const res = await fetch(`${BASE_URL}/barcode/lookup/${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error('Product not found for barcode / SKU');
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${BASE_URL}/reset-demo-data`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}
