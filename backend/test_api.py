from starlette.testclient import TestClient
from backend.main import app

def run_tests():
    client = TestClient(app)

    # 1. Barcode lookup
    res_bc = client.get('/api/barcode/lookup/8901001001')
    assert res_bc.status_code == 200
    print('1. Barcode lookup test passed:', res_bc.json()['name'])

    # 2. Quick adjustment
    res_adj = client.post('/api/products/1/adjust', json={
        'adjustment': 5,
        'reason': 'Test Restock',
        'performed_by': 'Tester'
    })
    assert res_adj.status_code == 200
    print('2. Quick adjust test passed:', res_adj.json())

    # 3. Auto reorder PO generation
    res_po = client.post('/api/ai/auto-reorder-po')
    assert res_po.status_code == 200
    print('3. Auto PO test passed:', res_po.json()['message'])

    # 4. Sales Order (POS / Outbound Invoice)
    res_so = client.post('/api/sales-orders', json={
        'customer_name': 'Acme Global Corp',
        'customer_email': 'procurement@acme.com',
        'payment_method': 'Credit Card',
        'items': [{'product_id': 1, 'quantity': 2, 'unit_price': 99.99}]
    })
    assert res_so.status_code == 200
    print('4. Sales order creation passed:', res_so.json()['order_number'], 'Total:', res_so.json()['total_amount'])

    # 5. Expiry Radar
    res_exp = client.get('/api/inventory/expiry-radar')
    assert res_exp.status_code == 200
    print('5. Expiry radar passed. Tracked items:', len(res_exp.json()))

    # 6. Warehouse Layout
    res_wh = client.get('/api/warehouse/layout')
    assert res_wh.status_code == 200
    print('6. Warehouse layout passed. Bins count:', len(res_wh.json()))

    # 7. Notifications
    res_notif = client.get('/api/notifications')
    assert res_notif.status_code == 200
    print('7. Notifications test passed. Total alerts:', len(res_notif.json()))

    # 8. Physical Audit Reconciliation
    res_audit = client.post('/api/audit/reconcile', json={
        'auditor_name': 'Senior Auditor',
        'items': [{'product_id': 1, 'physical_count': 50, 'notes': 'Routine verification'}]
    })
    assert res_audit.status_code == 200
    print('8. Physical audit test passed:', res_audit.json()['message'])

    print('\nALL ENTERPRISE INTEGRATION TESTS PASSED 100%!')

if __name__ == '__main__':
    run_tests()
