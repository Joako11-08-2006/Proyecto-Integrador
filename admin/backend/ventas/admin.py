from django.contrib import admin
from .models import Venta

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'producto', 'cantidad', 'total', 'fecha')
    list_filter = ('fecha',)
