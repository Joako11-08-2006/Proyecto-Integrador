from rest_framework import serializers
from .models import Producto, Categoria, Alerta

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = "__all__"


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Producto
        fields = "__all__"

    def validate_nombre(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("El nombre del producto es muy corto.")
        return value

    def validate(self, data):
        if data['precio'] < 0:
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return data


class AlertaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = Alerta
        fields = ['id', 'producto', 'producto_nombre', 'mensaje', 'creado_en', 'visto']
