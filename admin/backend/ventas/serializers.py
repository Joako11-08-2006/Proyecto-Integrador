from rest_framework import serializers
from .models import Venta

class VentaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = Venta
        fields = ['id', 'producto', 'producto_nombre', 'cantidad', 'fecha', 'total']
        read_only_fields = ['fecha']
