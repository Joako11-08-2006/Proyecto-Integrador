from django.contrib import admin
from .models import Categoria, Producto, Alerta

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre')


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'precio', 'stock', 'categoria', 'creado_en')
    list_filter = ('categoria',)
    search_fields = ('nombre',)


@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ('id', 'producto', 'mensaje', 'creado_en', 'visto')
    list_filter = ('visto',)
