from rest_framework import serializers
from decimal import Decimal, InvalidOperation
from .models import Producto, Categoria, Alerta, Promocion

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = "__all__"


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    descuento = serializers.SerializerMethodField(read_only=True)
    precio_con_descuento = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Producto
        fields = "__all__"
        read_only_fields = ["descuento", "precio_con_descuento"]

    def validate_nombre(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("El nombre del producto es muy corto.")
        return value

    def validate(self, data):
        precio = data.get('precio')
        if precio is not None and precio < 0:
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return data

    def create(self, validated_data):
        descuento = self.initial_data.get('descuento')
        obj = super().create(validated_data)
        self._upsert_promocion(obj, descuento)
        return obj

    def update(self, instance, validated_data):
        descuento = self.initial_data.get('descuento')
        obj = super().update(instance, validated_data)
        self._upsert_promocion(obj, descuento)
        return obj

    def get_descuento(self, obj):
        promo = Promocion.objects.filter(producto=obj, activo=True).order_by('-creado_en').first()
        if promo and promo.descuento:
            try:
                return Decimal(promo.descuento)
            except (InvalidOperation, TypeError):
                return 0
        return 0

    def get_precio_con_descuento(self, obj):
        desc = self.get_descuento(obj)
        if obj.precio is None:
            return obj.precio
        try:
            desc = Decimal(desc)
        except (InvalidOperation, TypeError):
            desc = Decimal(0)
        if desc <= 0:
            return obj.precio
        return (obj.precio * (Decimal(100) - desc) / Decimal(100)).quantize(Decimal("0.01"))

    def _upsert_promocion(self, producto, descuento):
        if descuento is None:
            return
        try:
            descuento = Decimal(descuento)
        except (InvalidOperation, TypeError):
            return
        promos = Promocion.objects.filter(producto=producto)
        if descuento > 0:
            promo = promos.filter(activo=True).first()
            if not promo:
                promo = Promocion(producto=producto, nombre=f"Promo {producto.nombre}")
            promo.descuento = descuento
            promo.activo = True
            promo.save()
        else:
            promos.update(activo=False)


class AlertaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = Alerta
        fields = ['id', 'producto', 'producto_nombre', 'mensaje', 'creado_en', 'visto']


class PromocionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = Promocion
        fields = "__all__"
