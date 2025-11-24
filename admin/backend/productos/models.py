from django.db import models
from django.core.validators import MinValueValidator

class Categoria(models.Model):
    nombre = models.CharField(max_length=200)

    def __str__(self):
        return self.nombre


STOCK_MINIMO = 5

class Producto(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    stock = models.IntegerField(validators=[MinValueValidator(0)])
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True)
    imagen_url = models.CharField(max_length=255, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        from .models import Alerta
        if self.stock <= STOCK_MINIMO:
            mensaje = f"El stock del producto '{self.nombre}' es bajo ({self.stock})."
            Alerta.objects.create(producto=self, mensaje=mensaje)

    def __str__(self):
        return self.nombre


class Alerta(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    mensaje = models.CharField(max_length=255)
    creado_en = models.DateTimeField(auto_now_add=True)
    visto = models.BooleanField(default=False)

    def __str__(self):
        return f"Alerta: {self.producto.nombre}"
