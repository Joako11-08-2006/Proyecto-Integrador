import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from decimal import Decimal

from productos.models import Producto
from ventas.models import Venta


class Command(BaseCommand):
    help = "Genera ventas simuladas de los últimos 60 días para poblar el dashboard."

    @transaction.atomic
    def handle(self, *args, **options):
        productos = list(Producto.objects.all())
        if not productos:
            self.stdout.write(self.style.WARNING("No hay productos para generar ventas."))
            return

        # Limpia ventas previas simuladas
        Venta.objects.all().delete()

        hoy = timezone.now().date()
        random.seed(42)

        ventas_creadas = 0
        for dias_atras in range(60):
            fecha = hoy - timedelta(days=dias_atras)
            # Cantidad de tickets por día (0 a 8)
            tickets = random.randint(0, 8)
            for _ in range(tickets):
                prod = random.choice(productos)
                cantidad = random.randint(1, 3)
                precio = prod.precio or Decimal("0")
                total = (precio * cantidad).quantize(Decimal("0.01"))
                Venta.objects.create(
                    producto=prod,
                    cantidad=cantidad,
                    total=total,
                    fecha=timezone.make_aware(timezone.datetime.combine(fecha, timezone.datetime.min.time())),
                )
                ventas_creadas += 1

        self.stdout.write(self.style.SUCCESS(f"Ventas simuladas creadas: {ventas_creadas}"))
