# InventoSmart AI — Enterprise Smart Inventory Management System

A production-grade, full-stack **Smart Inventory Management System** built with **FastAPI**, **SQLite**, **React (Vite)**, and **Tailwind CSS**. 

---

## 🌟 Comprehensive Feature Suite

### 1. 📊 Executive KPI Dashboard
- **Valuation Metrics**: Real-time asset capital valuation, potential retail revenue, and projected profit margin.
- **Stock Health Cards**: Live tracking of items that are **Low Stock** or **Out of Stock**.
- **Interactive Visualizations (Recharts)**:
  - 14-day Inbound Restocks vs Outbound Fulfillment velocity area chart.
  - Category capital share donut chart.
  - Top inventory capital assets leaderboard.

### 2. 🧾 Customer Sales & Order Invoicing (POS / Outbound Fulfillment)
- Create customer sales dispatch orders with live cart, quantity, tax, and discount calculation.
- Automatically validates inventory availability to prevent overselling.
- Decrements stock balances and logs outbound audit trail records upon dispatch.
- **Printable Tax Invoices / Packing Slips**: Generates official invoices with company headers, barcodes, line-item breakdowns, and tax totals.

### 3. 🧠 Predictive AI & Demand Intelligence (EOQ Engine)
- **Depletion Horizon**: Calculates daily consumption burn rates to predict exact days until stockout.
- **Economic Order Quantity (EOQ)**: Mathematically optimizes replenishment lot sizes to minimize inventory holding and order costs.
- **1-Click AI Auto-Reorder**: Analyzes all items at or below reorder threshold, groups them by supplier, and automatically drafts Purchase Orders.
- **ABC Inventory Analysis Matrix**: Automatically segments inventory into Class A (Top 80% capital), Class B (15%), and Class C (5% bulk).
- **Dead Stock / Slow Moving Detector**: Identifies products with zero outbound movements over 30 days and calculates tied-up capital.

### 4. ⏳ Perishables & Expiration Radar
- Color-coded batch shelf-life countdown (Expired, Critical < 30 days, Warning < 90 days, Fresh).
- Batch/lot number tracking and tied capital at risk.
- Quick markdown / clearance sale action button.

### 5. 🗺️ Warehouse Spatial Rack & Bin Visualizer
- 2D warehouse map showing shelf bins across Aisles A-E.
- Real-time occupancy percentage bars and unit capacity tracking.
- Interactive filtering: clicking any rack/bin instantly filters products stored in that location.

### 6. 📋 Cycle Count & Physical Inventory Stock Take
- Staff enters physical counted quantities against system expected quantities.
- Real-time variance calculation (+ / - difference).
- 1-click batch reconciliation that writes `ADJUSTMENT` logs and updates stock.

### 7. 📥 Bulk CSV Product Import
- Drag-and-drop or upload `.csv` files or paste CSV text directly.
- Batch creates new products, barcodes, and initial stock movements.

### 8. 🚚 Vendor Directory & Procurement Scorecards
- Supplier directory with ratings (1-5 stars), on-time lead times, and cumulative purchase spend.
- Direct vendor RFQ inquiry action.

### 9. 🔔 Real-Time Notification Center
- Dropdown bell alert drawer with priority badges for stockouts, low-stock warnings, expiring batches, and pending shipments.

### 10. 🌗 Dark / Light Mode & 💱 Multi-Currency Switcher
- Instant toggle between light and dark themes (persisted in `localStorage`).
- Live currency switcher supporting USD, EUR, GBP, INR, CAD, AUD, JPY, AED, and SGD.

---

## 🚀 How to Run

### 1-Click Launch (Recommended)
Double-click `start.bat` or run:
```bash
python run_app.py
```
This starts the backend server and automatically opens your browser at **http://127.0.0.1:8000**.
