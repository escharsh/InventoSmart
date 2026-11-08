import math
from datetime import datetime, timedelta

def compute_abc_analysis(products):
    """
    Performs ABC Inventory Analysis based on Total Stock Valuation.
    A: ~80% of total value (High priority)
    B: ~15% of total value (Medium priority)
    C: ~5% of total value (Low priority)
    """
    if not products:
        return []

    # Calculate item values
    items_with_val = []
    total_val = 0.0

    for p in products:
        val = float(p['quantity_on_hand']) * float(p['unit_cost'])
        total_val += val
        items_with_val.append({**p, 'stock_value': val})

    if total_val == 0:
        for p in items_with_val:
            p['abc_class'] = 'C'
            p['value_percentage'] = 0.0
        return items_with_val

    # Sort descending by value
    items_with_val.sort(key=lambda x: x['stock_value'], reverse=True)

    cum_val = 0.0
    for item in items_with_val:
        cum_val += item['stock_value']
        pct = (cum_val / total_val) * 100.0
        item['cum_percentage'] = round(pct, 2)
        item['value_percentage'] = round((item['stock_value'] / total_val) * 100.0, 2)

        if pct <= 80.0:
            item['abc_class'] = 'A'
        elif pct <= 95.0:
            item['abc_class'] = 'B'
        else:
            item['abc_class'] = 'C'

    return items_with_val

def compute_demand_forecasting(products, movements, days_window=30):
    """
    Computes daily burn rate, estimated days until stockout, and reorder urgency.
    """
    now = datetime.now()
    cutoff_date = (now - timedelta(days=days_window)).isoformat()

    # Aggregate outbound consumption by product_id
    outbound_totals = {}
    last_outbound_date = {}

    for m in movements:
        p_id = m['product_id']
        m_type = m['movement_type'].upper()
        created_at = m['created_at']

        if m_type == 'OUT':
            outbound_totals[p_id] = outbound_totals.get(p_id, 0) + m['quantity']
            if p_id not in last_outbound_date or created_at > last_outbound_date[p_id]:
                last_outbound_date[p_id] = created_at

    forecasts = []
    ORDER_FIXED_COST = 20.0  # $20 estimated administrative order placement cost
    HOLDING_COST_RATE = 0.20 # 20% annual holding cost rate

    for p in products:
        p_id = p['id']
        current_qty = p['quantity_on_hand']
        unit_cost = max(p['unit_cost'], 1.0)
        reorder_level = p['min_reorder_level']

        total_consumed = outbound_totals.get(p_id, 0)
        daily_burn_rate = round(total_consumed / max(days_window, 1), 2)

        # Days until stockout
        if daily_burn_rate > 0:
            days_left = round(current_qty / daily_burn_rate, 1)
            estimated_stockout_date = (now + timedelta(days=days_left)).strftime("%Y-%m-%d")
        else:
            days_left = 999
            estimated_stockout_date = "N/A (No sales/burn)"

        # Economic Order Quantity (EOQ) calculation
        annual_demand = max(daily_burn_rate * 365, float(p.get('reorder_quantity', 50)))
        holding_cost_per_unit = unit_cost * HOLDING_COST_RATE
        if holding_cost_per_unit > 0 and annual_demand > 0:
            eoq = round(math.sqrt((2 * annual_demand * ORDER_FIXED_COST) / holding_cost_per_unit))
            eoq = max(eoq, 5)
        else:
            eoq = p.get('reorder_quantity', 50)

        # Urgency & Status Assessment
        if current_qty == 0:
            urgency = 'OUT_OF_STOCK'
            action = 'Urgent Restock Required immediately'
            status_color = 'red'
        elif current_qty <= reorder_level or (days_left < 7 and daily_burn_rate > 0):
            urgency = 'CRITICAL_LOW'
            action = f'Reorder recommended! Stock depleting in {days_left} days.'
            status_color = 'amber'
        elif days_left < 14 and daily_burn_rate > 0:
            urgency = 'WATCH'
            action = f'Monitor closely; ~{days_left} days left.'
            status_color = 'yellow'
        else:
            urgency = 'OPTIMAL'
            action = 'Stock level is healthy'
            status_color = 'green'

        # Dead stock detection: 0 sales in past window and high stock
        is_dead_stock = (total_consumed == 0 and current_qty > 10)

        forecasts.append({
            'product_id': p_id,
            'sku': p['sku'],
            'name': p['name'],
            'category_name': p.get('category_name', 'General'),
            'supplier_id': p.get('supplier_id'),
            'supplier_name': p.get('supplier_name', 'Default Supplier'),
            'current_stock': current_qty,
            'unit_cost': p['unit_cost'],
            'selling_price': p['selling_price'],
            'min_reorder_level': reorder_level,
            'daily_burn_rate': daily_burn_rate,
            'days_until_stockout': days_left,
            'estimated_stockout_date': estimated_stockout_date,
            'recommended_order_quantity': max(eoq, p.get('reorder_quantity', 20)),
            'urgency': urgency,
            'status_color': status_color,
            'action_recommendation': action,
            'is_dead_stock': is_dead_stock,
            'dead_stock_value': round(current_qty * p['unit_cost'], 2) if is_dead_stock else 0.0,
            'total_sales_30d': total_consumed
        })

    # Sort so critical low and out of stock are at the top
    urgency_order = {'OUT_OF_STOCK': 0, 'CRITICAL_LOW': 1, 'WATCH': 2, 'OPTIMAL': 3}
    forecasts.sort(key=lambda x: (urgency_order.get(x['urgency'], 4), x['days_until_stockout']))

    return forecasts
