from django.db import models
from productos.models import Producto
from clientes.models import Cliente

class Comprobante(models.Model):
    TIPO_CHOICES = (
        ('BOLETA', 'Boleta'),
        ('FACTURA', 'Factura'),
    )

    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        cliente_nombre = self.cliente.nombre if self.cliente else "Sin cliente"
        return f"{self.tipo} - {cliente_nombre} - {self.total}"


class ComprobanteItem(models.Model):
    comprobante = models.ForeignKey(
        Comprobante,
        on_delete=models.CASCADE,
        related_name="items"
    )
    producto = models.ForeignKey(Producto, on_delete=models.SET_NULL, null=True)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def subtotal(self):
        return self.cantidad * self.precio_unitario
