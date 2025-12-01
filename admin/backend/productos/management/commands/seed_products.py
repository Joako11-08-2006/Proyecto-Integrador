from django.core.management.base import BaseCommand
from django.db import transaction
from decimal import Decimal

from productos.models import Categoria, Producto


PRODUCTS = [
    # Apple
    {
        "nombre": "iPhone 15 Pro Max",
        "marca": "Apple",
        "precio": Decimal("5699"),
        "stock": 12,
        "descripcion": '6.7" OLED 120Hz, A17 Pro, 8GB RAM, 256/512/1TB, 48+12+12MP, 4441mAh, iOS 17',
    },
    {
        "nombre": "iPhone 15 Pro",
        "marca": "Apple",
        "precio": Decimal("4999"),
        "stock": 10,
        "descripcion": '6.1" OLED 120Hz, A17 Pro, 8GB RAM, 128/256/512/1TB, 48+12+12MP, 3274mAh, iOS 17',
    },
    {
        "nombre": "iPhone 15 Plus",
        "marca": "Apple",
        "precio": Decimal("4499"),
        "stock": 15,
        "descripcion": '6.7" OLED 60Hz, A16 Bionic, 6GB RAM, 128/256/512GB, 48+12MP, 4383mAh, iOS 17',
    },
    {
        "nombre": "iPhone 15",
        "marca": "Apple",
        "precio": Decimal("3999"),
        "stock": 20,
        "descripcion": '6.1" OLED 60Hz, A16 Bionic, 6GB RAM, 128/256/512GB, 48+12MP, 3349mAh, iOS 17',
    },
    {
        "nombre": "iPhone SE 2022",
        "marca": "Apple",
        "precio": Decimal("1999"),
        "stock": 8,
        "descripcion": '4.7" Retina IPS, A15 Bionic, 4GB RAM, 64/128/256GB, 12MP, 2018mAh, iOS 17',
    },
    # Samsung
    {
        "nombre": "Samsung Galaxy S24 Ultra",
        "marca": "Samsung",
        "precio": Decimal("5799"),
        "stock": 18,
        "descripcion": '6.8" AMOLED 120Hz, Snapdragon 8 Gen 3, 12GB RAM, 256/512/1TB, 200+50+12+10MP, 5000mAh, Android 14',
    },
    {
        "nombre": "Samsung Galaxy S24+",
        "marca": "Samsung",
        "precio": Decimal("4499"),
        "stock": 14,
        "descripcion": '6.7" AMOLED 120Hz, Exynos 2400, 12GB RAM, 256/512GB, 50+12+10MP, 4900mAh, Android 14',
    },
    {
        "nombre": "Samsung Galaxy S24",
        "marca": "Samsung",
        "precio": Decimal("3999"),
        "stock": 22,
        "descripcion": '6.2" AMOLED 120Hz, Exynos 2400, 8GB RAM, 128/256/512GB, 50+12+10MP, 4000mAh, Android 14',
    },
    {
        "nombre": "Samsung Galaxy A54",
        "marca": "Samsung",
        "precio": Decimal("1899"),
        "stock": 25,
        "descripcion": '6.4" AMOLED 120Hz, Exynos 1380, 6/8GB RAM, 128/256GB, 50+12+5MP, 5000mAh, Android 14',
    },
    {
        "nombre": "Samsung Galaxy A34",
        "marca": "Samsung",
        "precio": Decimal("1499"),
        "stock": 30,
        "descripcion": '6.6" AMOLED 120Hz, Dimensity 1080, 6/8GB RAM, 128/256GB, 48+8+5MP, 5000mAh, Android 14',
    },
    # Xiaomi
    {
        "nombre": "Xiaomi 14 Ultra",
        "marca": "Xiaomi",
        "precio": Decimal("4999"),
        "stock": 10,
        "descripcion": '6.73" AMOLED 120Hz, Snapdragon 8 Gen 3, 12/16GB RAM, 256/512/1TB, 50MP quad, 5300mAh, HyperOS',
    },
    {
        "nombre": "Xiaomi 14",
        "marca": "Xiaomi",
        "precio": Decimal("3899"),
        "stock": 15,
        "descripcion": '6.36" AMOLED 120Hz, Snapdragon 8 Gen 3, 12GB RAM, 256/512GB, 50+50+50MP, 4610mAh, HyperOS',
    },
    {
        "nombre": "Xiaomi 13T Pro",
        "marca": "Xiaomi",
        "precio": Decimal("3299"),
        "stock": 22,
        "descripcion": '6.67" AMOLED 144Hz, Dimensity 9200+, 12/16GB RAM, 256/512/1TB, 50+50+12MP, 5000mAh, Android 14',
    },
    {
        "nombre": "Xiaomi Poco F5",
        "marca": "Xiaomi",
        "precio": Decimal("1899"),
        "stock": 18,
        "descripcion": '6.67" AMOLED 120Hz, Snapdragon 7+ Gen 2, 8/12GB RAM, 256GB, 64+8+2MP, 5000mAh, MIUI 14',
    },
    {
        "nombre": "Xiaomi Poco X6 Pro",
        "marca": "Xiaomi",
        "precio": Decimal("1799"),
        "stock": 20,
        "descripcion": '6.67" AMOLED 120Hz, Dimensity 8300 Ultra, 8/12GB RAM, 256/512GB, 64+8+2MP, 5000mAh, HyperOS',
    },
    # Redmi
    {
        "nombre": "Redmi Note 13 Pro+",
        "marca": "Redmi",
        "precio": Decimal("1599"),
        "stock": 25,
        "descripcion": '6.67" AMOLED 120Hz, Dimensity 7200 Ultra, 8/12GB RAM, 256/512GB, 200+8+2MP, 5000mAh, Android 14',
    },
    {
        "nombre": "Redmi Note 13 Pro",
        "marca": "Redmi",
        "precio": Decimal("1399"),
        "stock": 30,
        "descripcion": '6.67" AMOLED 120Hz, Snapdragon 7s Gen 2, 6/8/12GB RAM, 128/256/512GB, 200+8+2MP, 5100mAh, Android 14',
    },
    {
        "nombre": "Redmi Note 13",
        "marca": "Redmi",
        "precio": Decimal("1099"),
        "stock": 40,
        "descripcion": '6.67" AMOLED 120Hz, Helio G99, 4/6/8GB RAM, 128/256GB, 108+8+2MP, 5000mAh, Android 14',
    },
    {
        "nombre": "Redmi 13C",
        "marca": "Redmi",
        "precio": Decimal("799"),
        "stock": 35,
        "descripcion": '6.74" IPS 90Hz, Helio G85, 4/6/8GB RAM, 64/128/256GB, 50+2MP, 5000mAh, MIUI 14',
    },
    {
        "nombre": "Redmi Note 12 Pro 5G",
        "marca": "Redmi",
        "precio": Decimal("1299"),
        "stock": 28,
        "descripcion": '6.67" AMOLED 120Hz, Dimensity 1080, 6/8GB RAM, 128/256GB, 50+8+2MP, 5000mAh, Android 13',
    },
    # Google
    {
        "nombre": "Google Pixel 8 Pro",
        "marca": "Google",
        "precio": Decimal("4499"),
        "stock": 12,
        "descripcion": '6.7" LTPO OLED 120Hz, Tensor G3, 12GB RAM, 128/256/512/1TB, 50+48+48MP, 5050mAh, Android 14',
    },
    {
        "nombre": "Google Pixel 8",
        "marca": "Google",
        "precio": Decimal("3199"),
        "stock": 20,
        "descripcion": '6.2" OLED 120Hz, Tensor G3, 8GB RAM, 128/256GB, 50+12MP, 4575mAh, Android 14',
    },
    {
        "nombre": "Google Pixel 7 Pro",
        "marca": "Google",
        "precio": Decimal("2999"),
        "stock": 10,
        "descripcion": '6.7" OLED 120Hz, Tensor G2, 12GB RAM, 128/256/512GB, 50+48+12MP, 5000mAh, Android 14',
    },
    {
        "nombre": "Google Pixel 7",
        "marca": "Google",
        "precio": Decimal("2499"),
        "stock": 18,
        "descripcion": '6.3" OLED 90Hz, Tensor G2, 8GB RAM, 128/256GB, 50+12MP, 4355mAh, Android 14',
    },
    {
        "nombre": "Pixel 7a",
        "marca": "Google",
        "precio": Decimal("2099"),
        "stock": 25,
        "descripcion": '6.1" OLED 90Hz, Tensor G2, 8GB RAM, 128GB, 64+13MP, 4385mAh, Android 14',
    },
]


class Command(BaseCommand):
    help = "Carga 25 modelos de celulares y deja solo las categorías Apple, Samsung, Xiaomi, Redmi, Google."

    @transaction.atomic
    def handle(self, *args, **options):
        allowed = {"Apple", "Samsung", "Xiaomi", "Redmi", "Google"}

        self.stdout.write("Eliminando productos existentes...")
        Producto.objects.all().delete()

        self.stdout.write("Depurando categorías no permitidas sin productos...")
        for cat in Categoria.objects.all():
            if cat.nombre not in allowed:
                cat.delete()

        self.stdout.write("Creando categorías...")
        brand_map = {}
        for brand in allowed:
            cat, _ = Categoria.objects.get_or_create(nombre=brand)
            brand_map[brand] = cat

        self.stdout.write("Insertando productos...")
        for item in PRODUCTS:
            cat = brand_map.get(item["marca"])
            if not cat:
                continue
            Producto.objects.create(
                nombre=item["nombre"],
                descripcion=item["descripcion"],
                precio=item["precio"],
                stock=item["stock"],
                categoria=cat,
                imagen_url="",
            )

        self.stdout.write(self.style.SUCCESS("Productos y categorías cargados correctamente."))
