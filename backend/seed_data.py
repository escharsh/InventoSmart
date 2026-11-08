import random
from datetime import datetime, timedelta
from .database import get_db, init_db

def seed_database():
    init_db()

    with get_db() as conn:
        cursor = conn.cursor()

        # Check if already seeded
        cursor.execute("SELECT COUNT(*) FROM products")
        if cursor.fetchone()[0] > 0:
            print("Database already contains records. Skipping seed.")
            return

        print("Seeding sample inventory data...")

        # 1. Insert Categories
        categories = [
            ("Electronics & Hardware", "Computers, peripherals, smart gadgets, audio", "#3B82F6"),
            ("Office Supplies", "Stationery, paper, printer accessories", "#10B981"),
            ("Apparel & Safety Gear", "Workwear, vests, gloves, boots", "#F59E0B"),
            ("Health & Perishables", "First aid, wellness, organic pantry snacks", "#EC4899"),
            ("Packaging & Storage", "Cartons, bubble wraps, tapes, pallets", "#8B5CF6")
        ]

        for cat in categories:
            cursor.execute(
                "INSERT INTO categories (name, description, color) VALUES (?, ?, ?)",
                cat
            )

        # 2. Insert Suppliers
        suppliers = [
            ("Apex Global Tech Ltd", "David Vance", "david@apextech.io", "+1 (555) 234-5678", "102 Silicon Parkway, San Jose, CA", 5, 4.8),
            ("Prime Paper & Office Co", "Sarah Jenkins", "s.jenkins@primepaper.com", "+1 (555) 456-7890", "44 Industrial Blvd, Chicago, IL", 3, 4.6),
            ("ProShield Industrial Wear", "Carlos Mendez", "carlos@proshield.net", "+1 (555) 890-1234", "990 Warehouse Row, Austin, TX", 8, 4.4),
            ("PureHealth Organics", "Amina Ray", "amina@purehealth.org", "+1 (555) 678-9012", "55 Meadow Lane, Portland, OR", 4, 4.9),
            ("UltraPack Solutions", "Kevin Chen", "kchen@ultrapack.biz", "+1 (555) 345-6789", "12 Freight Way, Newark, NJ", 2, 4.7)
        ]

        for sup in suppliers:
            cursor.execute(
                """INSERT INTO suppliers 
                (name, contact_person, email, phone, address, lead_time_days, rating) 
                VALUES (?, ?, ?, ?, ?, ?, ?)""",
                sup
            )

        # 3. Insert Products
        # (sku, barcode, name, desc, cat_id, sup_id, cost, price, stock, min_reorder, max_cap, reorder_qty, location, unit, expiry, batch)
        products = [
            # Electronics
            ("SKU-TECH-001", "8901001001", "Logitech MX Master 3S Mouse", "Ergonomic wireless performance mouse", 1, 1, 65.0, 99.99, 45, 15, 200, 50, "Aisle A - Bin 12", "pcs", None, "BATCH-M2026-A"),
            ("SKU-TECH-002", "8901001002", "USB-C Fast Charging Hub 100W", "7-in-1 multi-port adapter with 4K HDMI", 1, 1, 24.5, 49.99, 8, 20, 300, 60, "Aisle A - Bin 14", "pcs", None, "BATCH-HUB-24"), # Low stock!
            ("SKU-TECH-003", "8901001003", "Mechanical Gaming Keyboard RGB", "Hot-swappable tactile switches, aluminum frame", 1, 1, 48.0, 89.99, 32, 10, 150, 40, "Aisle A - Bin 15", "pcs", None, "BATCH-KB-99"),
            ("SKU-TECH-004", "8901001004", "Noise Cancelling Headset Pro", "Dual-mic wireless ANC headset for calls", 1, 1, 85.0, 149.99, 3, 10, 100, 30, "Aisle A - Bin 18", "pcs", None, "BATCH-ANC-03"), # Critical low!
            ("SKU-TECH-005", "8901001005", "Smart Sensor Barcode Scanner", "Wireless 2D QR and UPC laser barcode scanner", 1, 1, 38.0, 69.99, 0, 12, 150, 40, "Aisle A - Bin 22", "pcs", None, "BATCH-SCN-01"), # Out of stock!

            # Office Supplies
            ("SKU-OFF-001", "8902002001", "Recycled Copy Paper A4 (5 Reams)", "Bright white 80gsm FSC certified eco paper", 2, 2, 18.0, 32.50, 85, 25, 500, 100, "Aisle B - Pallet 02", "box", None, "BATCH-PPR-88"),
            ("SKU-OFF-002", "8902002002", "Heavy Duty Steel Stapler", "Capacity up to 100 sheets with jam-free tech", 2, 2, 9.5, 19.99, 4, 15, 120, 40, "Aisle B - Bin 05", "pcs", None, "BATCH-STP-12"), # Low stock!
            ("SKU-OFF-003", "8902002003", "Gel Pen Fine Point 0.5mm (Pack of 12)", "Smooth black ink quick-drying pens", 2, 2, 4.2, 11.99, 140, 30, 400, 80, "Aisle B - Bin 09", "pack", None, "BATCH-PEN-55"),
            ("SKU-OFF-004", "8902002004", "Magnetic Dry-Erase Whiteboard 36x24", "Aluminum frame wall-mounted writing board", 2, 2, 28.0, 54.99, 19, 8, 80, 25, "Aisle B - Bin 16", "pcs", None, "BATCH-WBD-41"),

            # Apparel & Safety
            ("SKU-SAF-001", "8903003001", "High-Visibility Safety Vest XL", "ANSI class 2 certified reflective vest with pockets", 3, 3, 6.0, 14.50, 110, 25, 400, 100, "Aisle C - Rack 01", "pcs", None, "BATCH-VST-09"),
            ("SKU-SAF-002", "8903003002", "Kevlar Grip Work Gloves (Large)", "Cut-resistant level 5 nitrile coated palm", 3, 3, 5.5, 12.99, 72, 30, 300, 80, "Aisle C - Rack 04", "pair", None, "BATCH-GLV-77"),
            ("SKU-SAF-003", "8903003003", "Composite Toe Safety Work Boots #10", "Slip resistant oil-proof puncture resistant", 3, 3, 42.0, 89.99, 6, 12, 100, 30, "Aisle C - Rack 08", "pair", None, "BATCH-BOT-22"), # Critical low!

            # Health & Perishables
            ("SKU-HLT-001", "8904004001", "Commercial First Aid Kit 250-Piece", "OSHA compliant emergency medical supplies", 4, 4, 26.0, 48.00, 24, 10, 100, 25, "Aisle D - Bin 01", "kit", "2028-12-31", "BATCH-FAK-99"),
            ("SKU-HLT-002", "8904004002", "Organic Fair-Trade Coffee Beans (1kg)", "Dark roast Arabica whole bean coffee", 4, 4, 11.0, 22.50, 45, 15, 200, 50, "Aisle D - Bin 04", "bag", "2027-08-15", "BATCH-COF-14"),
            ("SKU-HLT-003", "8904004003", "Hand Sanitizer Gel Dispenser Refill 1L", "70% ethyl alcohol with aloe moisturizer", 4, 4, 4.5, 9.99, 60, 20, 250, 50, "Aisle D - Bin 06", "bottle", "2027-11-30", "BATCH-SAN-33"),

            # Packaging & Storage
            ("SKU-PKG-001", "8905005001", "Corrugated Shipping Boxes 12x9x6 (25pk)", "Durable 200 lb test crush-resistant cartons", 5, 5, 14.0, 28.00, 95, 25, 500, 100, "Aisle E - Pallet 01", "bundle", None, "BATCH-BOX-10"),
            ("SKU-PKG-002", "8905005002", "Industrial Stretch Wrap Film 18in x 1500ft", "Heavy duty 80 gauge pallet cling stretch film", 5, 5, 13.5, 26.50, 38, 15, 200, 50, "Aisle E - Pallet 03", "roll", None, "BATCH-WRP-02"),
            ("SKU-PKG-003", "8905005003", "Clear Shipping Packing Tape (6 Rolls)", "2.0 mil heavy duty acrylic adhesive tape", 5, 5, 7.0, 15.99, 150, 35, 600, 120, "Aisle E - Bin 02", "pack", None, "BATCH-TPE-48")
        ]

        for p in products:
            cursor.execute("""
            INSERT INTO products (
                sku, barcode, name, description, category_id, supplier_id,
                unit_cost, selling_price, quantity_on_hand, min_reorder_level,
                max_capacity, reorder_quantity, location, unit, expiry_date, batch_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, p)

        # 4. Create Historical Stock Movements (over last 25 days)
        now = datetime.now()
        cursor.execute("SELECT id, unit_cost, quantity_on_hand FROM products")
        all_products = cursor.fetchall()

        # Seed realistic inward and outward transactions
        movement_reasons_in = ["Restock Shipment", "Vendor Purchase Order", "Bulk Inbound", "Warehouse Transfer In"]
        movement_reasons_out = ["Customer Order Fulfillment", "Store Dispatch", "Branch Transfer Out", "Client Sale"]

        for prod in all_products:
            p_id = prod['id']
            cost = prod['unit_cost']
            current_qty = prod['quantity_on_hand']

            # Simulate an initial stock entry ~25 days ago
            initial_stock = current_qty + random.randint(30, 80)
            date_initial = (now - timedelta(days=25)).strftime("%Y-%m-%d %H:%M:%S")

            cursor.execute("""
            INSERT INTO stock_movements (
                product_id, movement_type, quantity, previous_stock, new_stock,
                unit_cost, total_cost, reason, reference_number, performed_by, created_at
            ) VALUES (?, 'IN', ?, 0, ?, ?, ?, 'Initial Stock Balance', 'REF-INIT', 'System Seed', ?)
            """, (p_id, initial_stock, initial_stock, cost, initial_stock * cost, date_initial))

            # Simulate 3 to 7 sales/dispatches over the past 3 weeks
            running_stock = initial_stock
            num_sales = random.randint(3, 7)
            for i in range(num_sales):
                days_ago = random.randint(1, 22)
                sale_date = (now - timedelta(days=days_ago, hours=random.randint(1, 10))).strftime("%Y-%m-%d %H:%M:%S")
                qty_out = random.randint(3, 15)
                if running_stock - qty_out < current_qty:
                    qty_out = max(1, running_stock - current_qty)
                
                prev = running_stock
                running_stock = max(0, running_stock - qty_out)
                
                cursor.execute("""
                INSERT INTO stock_movements (
                    product_id, movement_type, quantity, previous_stock, new_stock,
                    unit_cost, total_cost, reason, reference_number, performed_by, created_at
                ) VALUES (?, 'OUT', ?, ?, ?, ?, ?, ?, ?, 'Warehouse Staff', ?)
                """, (
                    p_id, qty_out, prev, running_stock,
                    cost, qty_out * cost,
                    random.choice(movement_reasons_out),
                    f"SO-{random.randint(10000, 99999)}",
                    sale_date
                ))

        # 5. Insert Sample Purchase Orders
        cursor.execute("""
        INSERT INTO purchase_orders (po_number, supplier_id, status, total_amount, notes, expected_date)
        VALUES 
        ('PO-2026-001', 1, 'ORDERED', 1240.00, 'Urgent replenishment for low stock hubs and mice', ?),
        ('PO-2026-002', 3, 'PENDING', 630.00, 'Work boots safety batch order', ?),
        ('PO-2026-003', 2, 'RECEIVED', 450.00, 'Quarterly stationery restock - completed', ?)
        """, (
            (now + timedelta(days=3)).strftime("%Y-%m-%d"),
            (now + timedelta(days=7)).strftime("%Y-%m-%d"),
            (now - timedelta(days=5)).strftime("%Y-%m-%d")
        ))

        cursor.execute("SELECT id FROM purchase_orders WHERE po_number = 'PO-2026-001'")
        po1_id = cursor.fetchone()[0]
        cursor.execute("INSERT INTO purchase_order_items (po_id, product_id, quantity, unit_cost) VALUES (?, 2, 40, 24.5)", (po1_id,))
        cursor.execute("INSERT INTO purchase_order_items (po_id, product_id, quantity, unit_cost) VALUES (?, 4, 3, 85.0)", (po1_id,))

        print("Sample inventory database initialized successfully!")

if __name__ == "__main__":
    seed_database()
