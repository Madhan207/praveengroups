# pyrefly: ignore [missing-import]
from django.contrib import admin
# pyrefly: ignore [missing-import]
from .models import Supplier, PurchaseOrder, PurchaseOrderItem

class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'email', 'phone', 'is_active')
    list_filter = ('business', 'is_active')
    search_fields = ('name', 'contact_person', 'email')

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    inlines = [PurchaseOrderItemInline]
    list_display = ('po_number', 'business', 'supplier', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'business')
    search_fields = ('po_number', 'supplier__name')
