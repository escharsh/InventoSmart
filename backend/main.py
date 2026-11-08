import os
import csv
import io
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import get_db, init_db
from .models import (
    ProductCreate, ProductUpdate, StockMovementCreate,
    QuickAdjustRequest, PurchaseOrderCreate, SupplierCreate, CategoryCreate,
    SalesOrderCreate, AuditReconcileRequest, BulkImportItem
)
from .ai_engine import compute_abc_analysis, compute_demand_forecasting
from .seed_data import seed_database

app = FastAPI(title="InventoSmart AI Enterprise", version="2.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    seed_database()

# ==========================================
# DASHBOARD & ANALYTICS
# ==========================================

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                COUNT(*) as total_products,
                SUM(quantity_on_hand) as total_units,
                SUM(quantity_on_hand * unit_cost) as total_inventory_value,
                SUM(quantity_on_hand * selling_price) as total_retail_value,
                SUM(CASE WHEN quantity_on_hand = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
                SUM(CASE WHEN quantity_on_hand > 0 AND quantity_on_hand <= min_reorder_level THEN 1 ELSE 0 END) as low_stock_count
            FROM products
        """)
        prod_row = cursor.fetchone()

        today_str = datetime.now().strftime("%Y-%m-%d")
        cursor.execute("""
            SELECT 
                COUNT(*) as today_movements,
                SUM(CASE WHEN movement_type = 'IN' THEN quantity ELSE 0 END) as units_in_today,
                SUM(CASE WHEN movement_type = 'OUT' THEN quantity ELSE 0 END) as units_out_today
            FROM stock_movements
            WHERE DATE(created_at) = DATE(?)
        """, (today_str,))
        mov_row = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) FROM purchase_orders WHERE status IN ('PENDING', 'ORDERED')")
        pending_pos = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM sales_orders WHERE status = 'COMPLETED'")
        completed_sales = cursor.fetchone()[0]

        cursor.execute("SELECT COALESCE(SUM(total_amount), 0) FROM sales_orders WHERE status = 'COMPLETED'")
        total_revenue = cursor.fetchone()[0]

        total_cost_val = prod_row["total_inventory_value"] or 0.0
        total_retail_val = prod_row["total_retail_value"] or 0.0
        potential_profit = total_retail_val - total_cost_val
        margin_pct = (potential_profit / total_retail_val * 100.0) if total_retail_val > 0 else 0.0

        return {
            "total_products": prod_row["total_products"] or 0,
            "total_units": prod_row["total_units"] or 0,
            "total_inventory_value": round(total_cost_val, 2),
            "total_retail_value": round(total_retail_val, 2),
            "potential_profit": round(potential_profit, 2),
            "projected_margin_pct": round(margin_pct, 1),
            "out_of_stock_count": prod_row["out_of_stock_count"] or 0,
            "low_stock_count": prod_row["low_stock_count"] or 0,
            "pending_purchase_orders": pending_pos,
            "completed_sales_orders": completed_sales,
            "total_sales_revenue": round(total_revenue, 2),
            "today_movements_count": mov_row["today_movements"] or 0,
            "today_units_in": mov_row["units_in_today"] or 0,
            "today_units_out": mov_row["units_out_today"] or 0
        }

@app.get("/api/dashboard/charts")
def get_dashboard_charts():
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                c.id, c.name, c.color,
                COUNT(p.id) as item_count,
                COALESCE(SUM(p.quantity_on_hand), 0) as total_units,
                COALESCE(SUM(p.quantity_on_hand * p.unit_cost), 0) as total_value
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id
        """)
        categories_data = [
            {
                "category_id": r["id"],
                "name": r["name"],
                "color": r["color"] or "#3B82F6",
                "item_count": r["item_count"],
                "total_units": r["total_units"],
                "total_value": round(r["total_value"], 2)
            }
            for r in cursor.fetchall()
        ]

        now = datetime.now()
        timeline = []
        for i in range(13, -1, -1):
            day_dt = now - timedelta(days=i)
            day_str = day_dt.strftime("%Y-%m-%d")
            day_label = day_dt.strftime("%b %d")

            cursor.execute("""
                SELECT 
                    COALESCE(SUM(CASE WHEN movement_type = 'IN' THEN quantity ELSE 0 END), 0) as units_in,
                    COALESCE(SUM(CASE WHEN movement_type = 'OUT' THEN quantity ELSE 0 END), 0) as units_out
                FROM stock_movements
                WHERE DATE(created_at) = DATE(?)
            """, (day_str,))
            row = cursor.fetchone()
            timeline.append({
                "date": day_str,
                "label": day_label,
                "inbound": row["units_in"],
                "outbound": row["units_out"]
            })

        cursor.execute("""
            SELECT name, sku, (quantity_on_hand * unit_cost) as total_value
            FROM products
            ORDER BY total_value DESC
            LIMIT 5
        """)
        top_val_items = [
            {"name": r["name"], "sku": r["sku"], "value": round(r["total_value"], 2)}
            for r in cursor.fetchall()
        ]

        return {
            "category_distribution": categories_data,
            "movement_trend_14d": timeline,
            "top_value_products": top_val_items
        }

# ==========================================
# NOTIFICATIONS & LIVE ALERTS
# ==========================================

@app.get("/api/notifications")
def get_notifications():
    with get_db() as conn:
        cursor = conn.cursor()
        notifications = []

        # Out of stock
        cursor.execute("SELECT id, name, sku FROM products WHERE quantity_on_hand = 0")
        for row in cursor.fetchall():
            notifications.append({
                "id": f"out-{row['id']}",
                "type": "CRITICAL",
                "title": f"Out of Stock: {row['name']}",
                "message": f"SKU {row['sku']} is at zero inventory. Immediate restock required.",
                "created_at": "Just now",
                "link_tab": "products"
            })

        # Low stock
        cursor.execute("""
            SELECT id, name, sku, quantity_on_hand, min_reorder_level 
            FROM products 
            WHERE quantity_on_hand > 0 AND quantity_on_hand <= min_reorder_level
        """)
        for row in cursor.fetchall():
            notifications.append({
                "id": f"low-{row['id']}",
                "type": "WARNING",
                "title": f"Low Stock Threshold: {row['name']}",
                "message": f"Only {row['quantity_on_hand']} units left (minimum: {row['min_reorder_level']}).",
                "created_at": "Today",
                "link_tab": "ai-forecast"
            })

        # Expiring soon (< 60 days)
        cursor.execute("""
            SELECT id, name, sku, expiry_date, batch_number 
            FROM products 
            WHERE expiry_date IS NOT NULL AND expiry_date <= date('now', '+60 days')
        """)
        for row in cursor.fetchall():
            notifications.append({
                "id": f"exp-{row['id']}",
                "type": "INFO",
                "title": f"Expiring Shelf Stock: {row['name']}",
                "message": f"Batch {row['batch_number'] or 'N/A'} reaches expiration on {row['expiry_date']}.",
                "created_at": "Upcoming",
                "link_tab": "expiry"
            })

        # Pending POs
        cursor.execute("SELECT id, po_number, expected_date FROM purchase_orders WHERE status = 'PENDING'")
        for row in cursor.fetchall():
            notifications.append({
                "id": f"po-{row['id']}",
                "type": "INFO",
                "title": f"Pending Purchase Order: {row['po_number']}",
                "message": f"Awaiting warehouse receipt (Expected: {row['expected_date'] or 'Soon'}).",
                "created_at": "In transit",
                "link_tab": "orders"
            })

        return notifications

# ==========================================
# PRODUCTS & BARCODES
# ==========================================

@app.get("/api/products")
def list_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
    stock_status: Optional[str] = None
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT 
                p.*,
                c.name as category_name,
                c.color as category_color,
                s.name as supplier_name,
                (p.quantity_on_hand * p.unit_cost) as total_cost_value,
                (p.quantity_on_hand * p.selling_price) as total_retail_value
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE 1=1
        """
        params = []

        if search:
            query += " AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ? OR p.location LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term, term, term])

        if category_id:
            query += " AND p.category_id = ?"
            params.append(category_id)

        if supplier_id:
            query += " AND p.supplier_id = ?"
            params.append(supplier_id)

        if stock_status == 'out':
            query += " AND p.quantity_on_hand = 0"
        elif stock_status == 'low':
            query += " AND p.quantity_on_hand > 0 AND p.quantity_on_hand <= p.min_reorder_level"
        elif stock_status == 'healthy':
            query += " AND p.quantity_on_hand > p.min_reorder_level"

        query += " ORDER BY p.id DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()

        products = []
        for r in rows:
            p_dict = dict(r)
            if p_dict["quantity_on_hand"] == 0:
                p_dict["status"] = "out_of_stock"
            elif p_dict["quantity_on_hand"] <= p_dict["min_reorder_level"]:
                p_dict["status"] = "low_stock"
            else:
                p_dict["status"] = "in_stock"
            products.append(p_dict)

        return products

@app.get("/api/products/{product_id}")
def get_product(product_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                p.*,
                c.name as category_name,
                c.color as category_color,
                s.name as supplier_name,
                s.lead_time_days
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.id = ?
        """, (product_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")

        prod = dict(row)
        cursor.execute("""
            SELECT * FROM stock_movements 
            WHERE product_id = ? 
            ORDER BY created_at DESC LIMIT 10
        """, (product_id,))
        prod["recent_movements"] = [dict(m) for m in cursor.fetchall()]
        return prod

@app.post("/api/products")
def create_product(product: ProductCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM products WHERE sku = ?", (product.sku,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="SKU already exists")

        barcode = product.barcode or ("BAR-" + product.sku.replace(" ", "").upper())

        cursor.execute("""
            INSERT INTO products (
                sku, barcode, name, description, category_id, supplier_id,
                unit_cost, selling_price, quantity_on_hand, min_reorder_level,
                max_capacity, reorder_quantity, location, unit, expiry_date, batch_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            product.sku, barcode, product.name, product.description,
            product.category_id, product.supplier_id, product.unit_cost,
            product.selling_price, product.quantity_on_hand, product.min_reorder_level,
            product.max_capacity, product.reorder_quantity, product.location,
            product.unit, product.expiry_date, product.batch_number
        ))
        new_id = cursor.lastrowid

        if product.quantity_on_hand > 0:
            cursor.execute("""
                INSERT INTO stock_movements (
                    product_id, movement_type, quantity, previous_stock, new_stock,
                    unit_cost, total_cost, reason, reference_number, performed_by
                ) VALUES (?, 'IN', ?, 0, ?, ?, ?, 'Initial Stock Balance', 'INIT-SETUP', 'System')
            """, (
                new_id, product.quantity_on_hand, product.quantity_on_hand,
                product.unit_cost, product.quantity_on_hand * product.unit_cost
            ))

        return {"id": new_id, "message": "Product created successfully"}

@app.put("/api/products/{product_id}")
def update_product(product_id: int, updates: ProductUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")

        fields = []
        params = []
        for field, val in updates.dict(exclude_unset=True).items():
            fields.append(f"{field} = ?")
            params.append(val)

        if not fields:
            return {"message": "No fields to update"}

        fields.append("updated_at = CURRENT_TIMESTAMP")
        query = f"UPDATE products SET {', '.join(fields)} WHERE id = ?"
        params.append(product_id)
        cursor.execute(query, params)

        return {"message": "Product updated successfully"}

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        return {"message": "Product deleted successfully"}

@app.get("/api/barcode/lookup/{code}")
def lookup_barcode(code: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, c.name as category_name, s.name as supplier_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.barcode = ? OR p.sku = ?
        """, (code, code))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No product found matching code")
        return dict(row)

# ==========================================
# EXPIRY DATE RADAR
# ==========================================

@app.get("/api/inventory/expiry-radar")
def get_expiry_radar():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                p.*, c.name as category_name, s.name as supplier_name,
                julianday(p.expiry_date) - julianday('now') as days_until_expiry
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.expiry_date IS NOT NULL
            ORDER BY days_until_expiry ASC
        """)
        rows = cursor.fetchall()

        items = []
        for r in rows:
            it = dict(r)
            days = round(it["days_until_expiry"]) if it["days_until_expiry"] is not None else 999
            it["days_remaining"] = days
            if days < 0:
                it["shelf_status"] = "EXPIRED"
                it["status_badge"] = "Expired"
            elif days <= 30:
                it["shelf_status"] = "EXPIRING_CRITICAL"
                it["status_badge"] = f"Expires in {days} days"
            elif days <= 90:
                it["shelf_status"] = "EXPIRING_SOON"
                it["status_badge"] = f"Expires in {days} days"
            else:
                it["shelf_status"] = "FRESH"
                it["status_badge"] = f"{days} days remaining"
            items.append(it)

        return items

# ==========================================
# CYCLE COUNT / AUDIT RECONCILIATION
# ==========================================

@app.post("/api/audit/reconcile")
def reconcile_inventory_audit(req: AuditReconcileRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        reconciled = []
        audit_ref = f"AUDIT-{datetime.now().strftime('%Y%m%d%H%M')}"

        for item in req.items:
            cursor.execute("SELECT * FROM products WHERE id = ?", (item.product_id,))
            prod = cursor.fetchone()
            if not prod:
                continue

            current_qty = prod["quantity_on_hand"]
            physical_qty = max(0, item.physical_count)
            variance = physical_qty - current_qty

            if variance != 0:
                cursor.execute(
                    "UPDATE products SET quantity_on_hand = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (physical_qty, item.product_id)
                )

                m_type = "IN" if variance > 0 else "OUT"
                cursor.execute("""
                    INSERT INTO stock_movements (
                        product_id, movement_type, quantity, previous_stock, new_stock,
                        unit_cost, total_cost, reason, reference_number, performed_by
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    item.product_id, m_type, abs(variance), current_qty, physical_qty,
                    prod["unit_cost"], abs(variance) * prod["unit_cost"],
                    f"Physical Count Variance ({item.notes or 'Reconciliation'})",
                    audit_ref, req.auditor_name
                ))

                reconciled.append({
                    "product_id": item.product_id,
                    "name": prod["name"],
                    "previous_stock": current_qty,
                    "counted_stock": physical_qty,
                    "variance": variance
                })

        return {
            "message": f"Successfully reconciled {len(reconciled)} inventory discrepancies",
            "audit_reference": audit_ref,
            "reconciled_items": reconciled
        }

# ==========================================
# SALES ORDERS & DISPATCH INVOICING (POS)
# ==========================================

@app.get("/api/sales-orders")
def list_sales_orders():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                so.*,
                COUNT(soi.id) as item_count,
                SUM(soi.quantity) as total_units_sold
            FROM sales_orders so
            LEFT JOIN sales_order_items soi ON so.id = soi.order_id
            GROUP BY so.id
            ORDER BY so.created_at DESC
        """)
        return [dict(r) for r in cursor.fetchall()]

@app.get("/api/sales-orders/{order_id}")
def get_sales_order(order_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sales_orders WHERE id = ?", (order_id,))
        order = cursor.fetchone()
        if not order:
            raise HTTPException(status_code=404, detail="Sales Order not found")

        order_dict = dict(order)
        cursor.execute("""
            SELECT soi.*, p.name as product_name, p.sku as product_sku, p.unit as product_unit
            FROM sales_order_items soi
            JOIN products p ON soi.product_id = p.id
            WHERE soi.order_id = ?
        """, (order_id,))
        order_dict["items"] = [dict(i) for i in cursor.fetchall()]
        return order_dict

@app.post("/api/sales-orders")
def create_sales_order(order_data: SalesOrderCreate):
    with get_db() as conn:
        cursor = conn.cursor()

        # Validate stock availability
        subtotal = 0.0
        verified_items = []
        for it in order_data.items:
            cursor.execute("SELECT * FROM products WHERE id = ?", (it.product_id,))
            prod = cursor.fetchone()
            if not prod:
                raise HTTPException(status_code=404, detail=f"Product {it.product_id} not found")
            if prod["quantity_on_hand"] < it.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{prod['name']}'. In stock: {prod['quantity_on_hand']}, requested: {it.quantity}"
                )
            line_total = it.quantity * it.unit_price
            subtotal += line_total
            verified_items.append((prod, it.quantity, it.unit_price, line_total))

        tax_amount = round(subtotal * (order_data.tax_rate or 0.08), 2)
        total_amount = round(subtotal + tax_amount - (order_data.discount_amount or 0.0), 2)
        order_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{cursor.execute('SELECT COUNT(*) FROM sales_orders').fetchone()[0] + 101}"

        cursor.execute("""
            INSERT INTO sales_orders (
                order_number, customer_name, customer_email, status,
                subtotal, tax_amount, discount_amount, total_amount, payment_method, notes
            ) VALUES (?, ?, ?, 'COMPLETED', ?, ?, ?, ?, ?, ?)
        """, (
            order_number, order_data.customer_name, order_data.customer_email,
            subtotal, tax_amount, order_data.discount_amount, total_amount,
            order_data.payment_method, order_data.notes
        ))
        order_id = cursor.lastrowid

        for prod, qty, price, line_total in verified_items:
            # Insert item
            cursor.execute("""
                INSERT INTO sales_order_items (order_id, product_id, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?)
            """, (order_id, prod["id"], qty, price, line_total))

            # Deduct stock
            prev_qty = prod["quantity_on_hand"]
            new_qty = prev_qty - qty
            cursor.execute(
                "UPDATE products SET quantity_on_hand = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (new_qty, prod["id"])
            )

            # Record stock movement
            cursor.execute("""
                INSERT INTO stock_movements (
                    product_id, movement_type, quantity, previous_stock, new_stock,
                    unit_cost, total_cost, reason, reference_number, performed_by
                ) VALUES (?, 'OUT', ?, ?, ?, ?, ?, 'Customer Order Dispatch', ?, 'POS Dispatch')
            """, (
                prod["id"], qty, prev_qty, new_qty, prod["unit_cost"], qty * prod["unit_cost"], order_number
            ))

        return {
            "order_id": order_id,
            "order_number": order_number,
            "total_amount": total_amount,
            "message": "Sales order completed and inventory dispatched successfully!"
        }

# ==========================================
# WAREHOUSE SPATIAL LAYOUT
# ==========================================

@app.get("/api/warehouse/layout")
def get_warehouse_layout():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                location,
                COUNT(id) as product_count,
                SUM(quantity_on_hand) as total_units,
                SUM(max_capacity) as total_capacity
            FROM products
            GROUP BY location
        """)
        rows = cursor.fetchall()

        bins = []
        for r in rows:
            loc = r["location"] or "Warehouse A - Bin 1"
            total_u = r["total_units"] or 0
            cap = r["total_capacity"] or 300
            occupancy = min(100, round((total_u / max(cap, 1)) * 100))
            bins.append({
                "location": loc,
                "product_count": r["product_count"],
                "total_units": total_u,
                "capacity": cap,
                "occupancy_pct": occupancy
            })

        return bins

# ==========================================
# BULK CSV IMPORT
# ==========================================

@app.post("/api/products/bulk-import")
def bulk_import_products(items: List[BulkImportItem]):
    with get_db() as conn:
        cursor = conn.cursor()
        imported = 0

        for it in items:
            cursor.execute("SELECT id FROM products WHERE sku = ?", (it.sku,))
            if cursor.fetchone():
                continue # Skip existing

            # Get or create category
            cat_id = None
            if it.category_name:
                cursor.execute("SELECT id FROM categories WHERE name = ?", (it.category_name,))
                cat_row = cursor.fetchone()
                if cat_row:
                    cat_id = cat_row[0]
                else:
                    cursor.execute("INSERT INTO categories (name) VALUES (?)", (it.category_name,))
                    cat_id = cursor.lastrowid

            barcode = it.barcode or ("BAR-" + it.sku.replace(" ", "").upper())
            cursor.execute("""
                INSERT INTO products (
                    sku, barcode, name, category_id, unit_cost, selling_price,
                    quantity_on_hand, min_reorder_level, location, unit
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                it.sku, barcode, it.name, cat_id, it.unit_cost, it.selling_price,
                it.quantity_on_hand, it.min_reorder_level, it.location, it.unit
            ))
            new_id = cursor.lastrowid

            if it.quantity_on_hand > 0:
                cursor.execute("""
                    INSERT INTO stock_movements (
                        product_id, movement_type, quantity, previous_stock, new_stock,
                        unit_cost, total_cost, reason, reference_number, performed_by
                    ) VALUES (?, 'IN', ?, 0, ?, ?, ?, 'Bulk Import Inbound', 'IMPORT-BATCH', 'Importer')
                """, (
                    new_id, it.quantity_on_hand, it.quantity_on_hand, it.unit_cost, it.quantity_on_hand * it.unit_cost
                ))

            imported += 1

        return {"message": f"Successfully imported {imported} new products into catalog"}

# ==========================================
# STOCK MOVEMENTS & ADJUSTMENTS
# ==========================================

@app.get("/api/movements")
def list_movements(
    limit: int = 50,
    movement_type: Optional[str] = None,
    product_id: Optional[int] = None
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT 
                m.*,
                p.name as product_name,
                p.sku as product_sku,
                p.unit as product_unit
            FROM stock_movements m
            JOIN products p ON m.product_id = p.id
            WHERE 1=1
        """
        params = []
        if movement_type:
            query += " AND m.movement_type = ?"
            params.append(movement_type.upper())
        if product_id:
            query += " AND m.product_id = ?"
            params.append(product_id)

        query += " ORDER BY m.created_at DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        return [dict(r) for r in cursor.fetchall()]

@app.post("/api/movements")
def create_movement(mov: StockMovementCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (mov.product_id,))
        prod = cursor.fetchone()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found")

        prev_qty = prod["quantity_on_hand"]
        m_type = mov.movement_type.upper()
        qty = abs(mov.quantity)

        if m_type == "OUT":
            if prev_qty < qty:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock. Available: {prev_qty}, requested: {qty}"
                )
            new_qty = prev_qty - qty
        elif m_type == "IN":
            new_qty = prev_qty + qty
        elif m_type == "ADJUSTMENT":
            new_qty = max(0, prev_qty + mov.quantity)
        else:
            raise HTTPException(status_code=400, detail="Invalid movement type")

        unit_cost = mov.unit_cost if mov.unit_cost else prod["unit_cost"]
        total_cost = qty * unit_cost

        cursor.execute(
            "UPDATE products SET quantity_on_hand = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (new_qty, mov.product_id)
        )

        cursor.execute("""
            INSERT INTO stock_movements (
                product_id, movement_type, quantity, previous_stock, new_stock,
                unit_cost, total_cost, reason, reference_number, performed_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            mov.product_id, m_type, qty, prev_qty, new_qty,
            unit_cost, total_cost, mov.reason, mov.reference_number, mov.performed_by
        ))

        return {
            "success": True,
            "previous_stock": prev_qty,
            "new_stock": new_qty,
            "movement_type": m_type
        }

@app.post("/api/products/{product_id}/adjust")
def quick_adjust_stock(product_id: int, req: QuickAdjustRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        prod = cursor.fetchone()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found")

        prev_qty = prod["quantity_on_hand"]
        new_qty = prev_qty + req.adjustment
        if new_qty < 0:
            raise HTTPException(status_code=400, detail="Stock cannot be negative")

        m_type = "IN" if req.adjustment > 0 else "OUT"
        qty = abs(req.adjustment)
        unit_cost = prod["unit_cost"]

        cursor.execute(
            "UPDATE products SET quantity_on_hand = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (new_qty, product_id)
        )

        cursor.execute("""
            INSERT INTO stock_movements (
                product_id, movement_type, quantity, previous_stock, new_stock,
                unit_cost, total_cost, reason, reference_number, performed_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'QUICK-ADJUST', ?)
        """, (
            product_id, m_type, qty, prev_qty, new_qty,
            unit_cost, qty * unit_cost, req.reason, req.performed_by
        ))

        return {"previous_stock": prev_qty, "new_stock": new_qty}

# ==========================================
# SMART AI FORECASTS & EOQ
# ==========================================

@app.get("/api/ai/forecasts")
def get_ai_forecasts():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, c.name as category_name, s.name as supplier_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
        """)
        products = [dict(r) for r in cursor.fetchall()]

        cursor.execute("""
            SELECT product_id, movement_type, quantity, created_at
            FROM stock_movements
            WHERE created_at >= datetime('now', '-30 days')
        """)
        movements = [dict(r) for r in cursor.fetchall()]

        forecasts = compute_demand_forecasting(products, movements)
        abc_items = compute_abc_analysis(products)

        critical_count = sum(1 for f in forecasts if f['urgency'] in ['OUT_OF_STOCK', 'CRITICAL_LOW'])
        dead_stock_count = sum(1 for f in forecasts if f['is_dead_stock'])
        total_dead_stock_val = sum(f['dead_stock_value'] for f in forecasts)

        return {
            "forecasts": forecasts,
            "abc_analysis": abc_items,
            "critical_reorder_count": critical_count,
            "dead_stock_count": dead_stock_count,
            "total_dead_stock_value": round(total_dead_stock_val, 2)
        }

@app.post("/api/ai/auto-reorder-po")
def auto_generate_purchase_orders():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, s.name as supplier_name, s.lead_time_days
            FROM products p
            JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.quantity_on_hand <= p.min_reorder_level
        """)
        items_to_reorder = [dict(r) for r in cursor.fetchall()]

        if not items_to_reorder:
            return {"message": "All stock levels are optimal. No reorders needed!", "created_pos": []}

        by_supplier = {}
        for item in items_to_reorder:
            sup_id = item['supplier_id']
            by_supplier.setdefault(sup_id, []).append(item)

        created_pos = []
        now = datetime.now()

        for sup_id, items in by_supplier.items():
            lead_time = items[0].get('lead_time_days', 7)
            expected_date = (now + timedelta(days=lead_time)).strftime("%Y-%m-%d")
            po_num = f"PO-AUTO-{datetime.now().strftime('%m%d%H%M')}-{sup_id}"

            total_amount = sum(it['unit_cost'] * it['reorder_quantity'] for it in items)

            cursor.execute("""
                INSERT INTO purchase_orders (po_number, supplier_id, status, total_amount, notes, expected_date)
                VALUES (?, ?, 'PENDING', ?, 'Auto-generated by AI Reorder Intelligence', ?)
            """, (po_num, sup_id, total_amount, expected_date))
            po_id = cursor.lastrowid

            for it in items:
                cursor.execute("""
                    INSERT INTO purchase_order_items (po_id, product_id, quantity, unit_cost)
                    VALUES (?, ?, ?, ?)
                """, (po_id, it['id'], it['reorder_quantity'], it['unit_cost']))

            created_pos.append({
                "po_id": po_id,
                "po_number": po_num,
                "supplier_name": items[0]['supplier_name'],
                "item_count": len(items),
                "total_amount": round(total_amount, 2)
            })

        return {
            "message": f"Successfully generated {len(created_pos)} Purchase Orders for low-stock items",
            "created_pos": created_pos
        }

# ==========================================
# PURCHASE ORDERS & PROCUREMENT
# ==========================================

@app.get("/api/purchase-orders")
def list_purchase_orders():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                po.*,
                s.name as supplier_name,
                COUNT(poi.id) as item_count
            FROM purchase_orders po
            LEFT JOIN suppliers s ON po.supplier_id = s.id
            LEFT JOIN purchase_order_items poi ON po.id = poi.po_id
            GROUP BY po.id
            ORDER BY po.created_at DESC
        """)
        return [dict(r) for r in cursor.fetchall()]

@app.post("/api/purchase-orders")
def create_purchase_order(po_data: PurchaseOrderCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        po_number = f"PO-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        total_amount = sum(i.quantity * i.unit_cost for i in po_data.items)

        cursor.execute("""
            INSERT INTO purchase_orders (po_number, supplier_id, status, total_amount, notes, expected_date)
            VALUES (?, ?, 'PENDING', ?, ?, ?)
        """, (po_number, po_data.supplier_id, total_amount, po_data.notes, po_data.expected_date))
        po_id = cursor.lastrowid

        for item in po_data.items:
            cursor.execute("""
                INSERT INTO purchase_order_items (po_id, product_id, quantity, unit_cost)
                VALUES (?, ?, ?, ?)
            """, (po_id, item.product_id, item.quantity, item.unit_cost))

        return {"id": po_id, "po_number": po_number, "total_amount": total_amount}

@app.post("/api/purchase-orders/{po_id}/receive")
def receive_purchase_order(po_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM purchase_orders WHERE id = ?", (po_id,))
        po = cursor.fetchone()
        if not po:
            raise HTTPException(status_code=404, detail="PO not found")
        if po["status"] == "RECEIVED":
            raise HTTPException(status_code=400, detail="Purchase Order already received")

        cursor.execute("SELECT * FROM purchase_order_items WHERE po_id = ?", (po_id,))
        items = cursor.fetchall()

        for item in items:
            p_id = item["product_id"]
            qty = item["quantity"]
            cost = item["unit_cost"]

            cursor.execute("SELECT quantity_on_hand FROM products WHERE id = ?", (p_id,))
            prod = cursor.fetchone()
            prev_qty = prod["quantity_on_hand"] if prod else 0
            new_qty = prev_qty + qty

            cursor.execute("""
                UPDATE products 
                SET quantity_on_hand = ?, unit_cost = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (new_qty, cost, p_id))

            cursor.execute("""
                INSERT INTO stock_movements (
                    product_id, movement_type, quantity, previous_stock, new_stock,
                    unit_cost, total_cost, reason, reference_number, performed_by
                ) VALUES (?, 'IN', ?, ?, ?, ?, ?, 'PO Receipt Restock', ?, 'Purchasing')
            """, (
                p_id, qty, prev_qty, new_qty, cost, qty * cost, po["po_number"]
            ))

        cursor.execute("""
            UPDATE purchase_orders 
            SET status = 'RECEIVED', received_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        """, (po_id,))

        return {"message": "Purchase order received and inventory stock successfully updated!"}

# ==========================================
# CATEGORIES & SUPPLIERS
# ==========================================

@app.get("/api/categories")
def list_categories():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id
        """)
        return [dict(r) for r in cursor.fetchall()]

@app.get("/api/suppliers")
def list_suppliers():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                s.*, 
                COUNT(p.id) as product_count,
                COALESCE(SUM(po.total_amount), 0) as total_spend
            FROM suppliers s
            LEFT JOIN products p ON s.id = p.supplier_id
            LEFT JOIN purchase_orders po ON s.id = po.supplier_id AND po.status = 'RECEIVED'
            GROUP BY s.id
        """)
        return [dict(r) for r in cursor.fetchall()]

@app.post("/api/suppliers")
def create_supplier(sup: SupplierCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO suppliers (name, contact_person, email, phone, address, lead_time_days, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            sup.name, sup.contact_person, sup.email, sup.phone,
            sup.address, sup.lead_time_days, sup.rating
        ))
        return {"id": cursor.lastrowid, "message": "Supplier created"}

# ==========================================
# CSV EXPORT & DEMO RESET
# ==========================================

@app.get("/api/export/csv")
def export_csv():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                p.sku, p.barcode, p.name, c.name as category, s.name as supplier,
                p.unit_cost, p.selling_price, p.quantity_on_hand, p.min_reorder_level,
                p.location, p.unit, p.batch_number, p.expiry_date
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
        """)
        rows = cursor.fetchall()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "SKU", "Barcode", "Product Name", "Category", "Supplier",
            "Unit Cost ($)", "Selling Price ($)", "Stock Qty", "Min Reorder Level",
            "Warehouse Location", "Unit", "Batch Number", "Expiry Date"
        ])
        for r in rows:
            writer.writerow(list(r))

        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=inventory_report.csv"}
        )

@app.post("/api/reset-demo-data")
def reset_demo_data():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS sales_order_items")
        cursor.execute("DROP TABLE IF EXISTS sales_orders")
        cursor.execute("DROP TABLE IF EXISTS purchase_order_items")
        cursor.execute("DROP TABLE IF EXISTS purchase_orders")
        cursor.execute("DROP TABLE IF EXISTS stock_movements")
        cursor.execute("DROP TABLE IF EXISTS products")
        cursor.execute("DROP TABLE IF EXISTS suppliers")
        cursor.execute("DROP TABLE IF EXISTS categories")
    init_db()
    seed_database()
    return {"message": "Database successfully reset and re-seeded with demo data!"}

FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")
