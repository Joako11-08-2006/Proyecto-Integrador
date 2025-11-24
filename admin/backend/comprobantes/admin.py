from django.contrib import admin
from .models import Comprobante, ComprobanteItem

class ComprobanteItemInline(admin.TabularInline):
    model = ComprobanteItem
    extra = 0

@admin.register(Comprobante)
class ComprobanteAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo', 'cliente', 'fecha', 'total')
    inlines = [ComprobanteItemInline]
