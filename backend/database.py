import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inventory.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Categories table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            color TEXT DEFAULT '#3B82F6',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Suppliers table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact_person TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            lead_time_days INTEGER DEFAULT 7,
            rating REAL DEFAULT 4.5,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Products table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT UNIQUE NOT NULL,
            barcode TEXT UNIQUE,
            name TEXT NOT NULL,
            description TEXT,
            category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
            supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
            unit_cost REAL NOT NULL DEFAULT 0.0,
            selling_price REAL NOT NULL DEFAULT 0.0,
            quantity_on_hand INTEGER NOT NULL DEFAULT 0,
            min_reorder_level INTEGER NOT NULL DEFAULT 10,
            max_capacity INTEGER NOT NULL DEFAULT 500,
            reorder_quantity INTEGER NOT NULL DEFAULT 50,
            location TEXT DEFAULT 'Warehouse A - Bin 1',
            unit TEXT DEFAULT 'pcs',
            expiry_date TEXT,
            batch_number TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Stock Movements table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS stock_movements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            movement_type TEXT NOT NULL, -- 'IN', 'OUT', 'ADJUSTMENT'
            quantity INTEGER NOT NULL,
            previous_stock INTEGER NOT NULL,
            new_stock INTEGER NOT NULL,
            unit_cost REAL DEFAULT 0.0,
            total_cost REAL DEFAULT 0.0,
            reason TEXT,
            reference_number TEXT,
            performed_by TEXT DEFAULT 'System Admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Purchase Orders table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS purchase_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            po_number TEXT UNIQUE NOT NULL,
            supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
            status TEXT DEFAULT 'PENDING', -- 'PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED'
            total_amount REAL DEFAULT 0.0,
            notes TEXT,
            expected_date TEXT,
            received_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Purchase Order Items
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS purchase_order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL,
            unit_cost REAL NOT NULL,
            received_quantity INTEGER DEFAULT 0
        );
        """)

        # Sales Orders table (Outbound Customer Invoices / POS)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sales_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT,
            status TEXT DEFAULT 'COMPLETED', -- 'COMPLETED', 'PENDING', 'CANCELLED'
            subtotal REAL DEFAULT 0.0,
            tax_amount REAL DEFAULT 0.0,
            discount_amount REAL DEFAULT 0.0,
            total_amount REAL DEFAULT 0.0,
            payment_method TEXT DEFAULT 'Credit Card',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Sales Order Items
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sales_order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL
        );
        """)

        # Settings
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
        """)
