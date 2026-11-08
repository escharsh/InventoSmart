from pydantic import BaseModel, Field
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#3B82F6"

class CategoryCreate(CategoryBase):
    pass

class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    lead_time_days: int = 7
    rating: float = 4.5

class SupplierCreate(SupplierBase):
    pass

class ProductBase(BaseModel):
    sku: str
    barcode: Optional[str] = None
    name: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    unit_cost: float = 0.0
    selling_price: float = 0.0
    quantity_on_hand: int = 0
    min_reorder_level: int = 10
    max_capacity: int = 500
    reorder_quantity: int = 50
    location: Optional[str] = "Warehouse A - Bin 1"
    unit: Optional[str] = "pcs"
    expiry_date: Optional[str] = None
    batch_number: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    barcode: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    unit_cost: Optional[float] = None
    selling_price: Optional[float] = None
    quantity_on_hand: Optional[int] = None
    min_reorder_level: Optional[int] = None
    max_capacity: Optional[int] = None
    reorder_quantity: Optional[int] = None
    location: Optional[str] = None
    unit: Optional[str] = None
    expiry_date: Optional[str] = None
    batch_number: Optional[str] = None

class StockMovementCreate(BaseModel):
    product_id: int
    movement_type: str # 'IN', 'OUT', 'ADJUSTMENT'
    quantity: int
    unit_cost: Optional[float] = 0.0
    reason: Optional[str] = "Inventory update"
    reference_number: Optional[str] = None
    performed_by: Optional[str] = "Staff Admin"

class QuickAdjustRequest(BaseModel):
    adjustment: int
    reason: str
    performed_by: Optional[str] = "Staff Admin"

class PurchaseOrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_cost: float

class PurchaseOrderCreate(BaseModel):
    supplier_id: int
    notes: Optional[str] = None
    expected_date: Optional[str] = None
    items: List[PurchaseOrderItemCreate]

class SalesOrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class SalesOrderCreate(BaseModel):
    customer_name: str
    customer_email: Optional[str] = None
    payment_method: Optional[str] = "Credit Card"
    notes: Optional[str] = None
    discount_amount: Optional[float] = 0.0
    tax_rate: Optional[float] = 0.08 # 8% default tax
    items: List[SalesOrderItemCreate]

class AuditVarianceItem(BaseModel):
    product_id: int
    physical_count: int
    notes: Optional[str] = None

class AuditReconcileRequest(BaseModel):
    auditor_name: str
    items: List[AuditVarianceItem]

class BulkImportItem(BaseModel):
    sku: str
    barcode: Optional[str] = None
    name: str
    category_name: Optional[str] = "General"
    unit_cost: float
    selling_price: float
    quantity_on_hand: int
    min_reorder_level: int = 10
    location: Optional[str] = "Warehouse A - Bin 1"
    unit: Optional[str] = "pcs"
