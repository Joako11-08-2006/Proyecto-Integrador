import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from productos.models import Producto
from ventas.models import Venta


class Command(BaseCommand):
    help = "Genera ventas simuladas de los últimos 60 días para poblar el dashboard"

    def add_arguments(self, parser):
        parser.add_argument(
            "--cantidad",
            type=int,
            default=400,
            help="Número de ventas a generar (default: 400)",
        )

    def handle(self, *args, **options):
        total_registros = options["cantidad"]
        productos = list(Producto.objects.all())

        if not productos:
            self.stdout.write(self.style.ERROR("No hay productos en la base de datos."))
            return

        inicio = timezone.now() - timedelta(days=60)

        ventas_creadas = 0
        for _ in range(total_registros):
            producto = random.choice(productos)
            fecha = inicio + timedelta(
                seconds=random.randint(0, int((timezone.now() - inicio).total_seconds()))
            )
            cantidad = random.randint(1, 4)
            precio = producto.precio or Decimal("0")
            total = (precio * Decimal(cantidad)).quantize(Decimal("0.01"))

            venta = Venta.objects.create(
                producto=producto,
                cantidad=cantidad,
                total=total,
            )
            # Sobrescribimos la fecha (auto_now_add impide asignarla en create)
            Venta.objects.filter(pk=venta.pk).update(fecha=fecha, total=total)
            ventas_creadas += 1

        self.stdout.write(
            self.style.SUCCESS(f"Ventas simuladas generadas: {ventas_creadas}")
        )
