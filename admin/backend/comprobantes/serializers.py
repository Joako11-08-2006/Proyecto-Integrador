from rest_framework import serializers
from .models import Comprobante, ComprobanteItem
from productos.models import Producto

class ComprobanteItemSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = ComprobanteItem
        fields = [
            'id',
            'producto',
            'producto_nombre',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]

    def get_subtotal(self, obj):
        return obj.cantidad * obj.precio_unitario


class ComprobanteSerializer(serializers.ModelSerializer):
    # items enviados desde el frontend
    items = ComprobanteItemSerializer(many=True, write_only=True)
    # items devueltos en la respuesta
    detalle = ComprobanteItemSerializer(source='items', many=True, read_only=True)

    class Meta:
        model = Comprobante
        fields = ['id', 'tipo', 'cliente', 'fecha', 'total', 'items', 'detalle']
        read_only_fields = ['fecha', 'total']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        # calcular total
        total = 0
        for item in items_data:
            total += item['cantidad'] * item['precio_unitario']

        comprobante = Comprobante.objects.create(total=total, **validated_data)

        for item in items_data:
            producto = item.get('producto')
            # opcional: podrías validar stock aquí
            ComprobanteItem.objects.create(
                comprobante=comprobante,
                producto=producto,
                cantidad=item['cantidad'],
                precio_unitario=item['precio_unitario'],
            )

        return comprobante
