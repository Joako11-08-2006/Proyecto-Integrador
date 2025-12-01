from django.db import models
from django.contrib.auth.models import User

ROL_CHOICES = (
    ("Cliente", "Cliente"),
    ("Admin", "Admin"),
    ("SuperAdmin", "SuperAdmin"),
)

class Cliente(models.Model):
    usuario = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="cliente",
        null=True,
        blank=True
    )
    nombre = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True)
    direccion = models.CharField(max_length=300, blank=True)
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default="Cliente")
    permisos_extra = models.JSONField(default=dict, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre
