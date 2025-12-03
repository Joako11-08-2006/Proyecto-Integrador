from rest_framework import serializers
from productos.models import Producto
from .models import Comprobante, ComprobanteItem


class ComprobanteItemReadSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source="producto.nombre", read_only=True)
    producto_marca = serializers.CharField(source="producto.categoria_nombre", read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = ComprobanteItem
        fields = [
            "id",
            "producto",
            "producto_nombre",
            "producto_marca",
            "cantidad",
            "precio_unitario",
            "subtotal",
        ]

    def get_subtotal(self, obj):
        return obj.cantidad * obj.precio_unitario


class ComprobanteCreateSerializer(serializers.ModelSerializer):
    # items enviados desde el frontend: [{producto_id, cantidad}]
    items = serializers.ListField(child=serializers.DictField(), write_only=True)

    class Meta:
        model = Comprobante
        fields = ["id", "tipo", "cliente", "estado", "items"]
        extra_kwargs = {"cliente": {"required": False, "allow_null": True}}

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        validated_data.pop("cliente", None)  # cliente opcional, ignoramos si no llega
        comp = Comprobante.objects.create(total=0, **validated_data)
        total = 0

        for item in items_data:
            producto = Producto.objects.get(id=item["producto_id"])
            cantidad = int(item.get("cantidad", 1))
            precio = producto.precio

            ComprobanteItem.objects.create(
                comprobante=comp,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio,
            )
            total += precio * cantidad

        comp.total = total
        comp.save(update_fields=["total"])
        return comp


class ComprobanteDetailSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source="cliente.nombre", read_only=True)
    items = ComprobanteItemReadSerializer(source="items", many=True, read_only=True)

    class Meta:
        model = Comprobante
        fields = ["id", "tipo", "cliente", "cliente_nombre", "fecha", "estado", "total", "items"]
        read_only_fields = ["fecha", "total"]
