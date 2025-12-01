from datetime import timedelta
from django.utils import timezone

from django.db.models import Sum, Count
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from django.http import HttpResponse

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Venta
from .serializers import VentaSerializer


class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all().order_by("-fecha")
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class VentaStatsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        hoy = timezone.now()
        desde = hoy - timedelta(days=60)  # 2 meses
        ventas = Venta.objects.filter(fecha__gte=desde)

        ingresos_totales = ventas.aggregate(total=Sum("total")).get("total") or 0
        ingresos_totales = float(ingresos_totales)
        total_ventas = ventas.aggregate(cnt=Count("id")).get("cnt") or 0
        ticket_promedio = ingresos_totales / total_ventas if total_ventas else 0

        def build_series(qs, trunc_fn, label_fmt):
            data = (
                qs.annotate(period=trunc_fn("fecha"))
                .values("period")
                .annotate(total=Sum("total"), cantidad=Sum("cantidad"))
                .order_by("period")
            )
            ventas_s = []
            ingresos_s = []
            for d in data:
                period = d["period"]
                label = period.strftime(label_fmt) if period else ""
                ventas_s.append({"name": label, "valor": int(d["cantidad"] or 0)})
                ingresos_s.append({"name": label, "valor": float(d["total"] or 0)})
            return ventas_s, ingresos_s

        ventas_por_dia, ingresos_por_dia = build_series(ventas, TruncDay, "%Y-%m-%d")
        ventas_por_semana, ingresos_por_semana = build_series(ventas, TruncWeek, "Sem %W")
        ventas_por_mes, ingresos_por_mes = build_series(ventas, TruncMonth, "%Y-%m")

        top_products = (
            ventas.values("producto__nombre", "producto__categoria__nombre")
            .annotate(ingresos=Sum("total"), unidades=Sum("cantidad"))
            .order_by("-unidades")[:5]
        )
        top_products = [
            {
                "nombre": tp["producto__nombre"],
                "marca": tp["producto__categoria__nombre"],
                "ingresos": float(tp["ingresos"] or 0),
                "unidades": int(tp["unidades"] or 0),
            }
            for tp in top_products
        ]

        return Response(
            {
                "ingresos_totales": ingresos_totales,
                "total_ventas": total_ventas,
                "ticket_promedio": ticket_promedio,
                "cambio_ingresos": "+0%",
                "cambio_ventas": "+0%",
                "cambio_ticket": "+0%",
                "ventas_por_dia": list(ventas_por_dia),
                "ingresos_por_dia": list(ingresos_por_dia),
                "ventas_por_semana": list(ventas_por_semana),
                "ingresos_por_semana": list(ingresos_por_semana),
                "ventas_por_mes": list(ventas_por_mes),
                "ingresos_por_mes": list(ingresos_por_mes),
                "top_products": list(top_products),
            }
        )


class VentaReportAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        group_by = request.query_params.get("group_by", "day")

        qs = Venta.objects.all()
        if start:
            qs = qs.filter(fecha__date__gte=start)
        if end:
            qs = qs.filter(fecha__date__lte=end)

        grouper = {
            "day": TruncDay("fecha"),
            "week": TruncWeek("fecha"),
            "month": TruncMonth("fecha"),
        }.get(group_by, TruncDay("fecha"))

        data = (
            qs.annotate(periodo=grouper)
            .values("periodo")
            .annotate(total=Sum("total"), cantidad=Sum("cantidad"))
            .order_by("periodo")
        )

        return Response({"group_by": group_by, "items": list(data)})


class VentaCSVExportAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")

        qs = Venta.objects.all().select_related("producto")
        if start:
            qs = qs.filter(fecha__date__gte=start)
        if end:
            qs = qs.filter(fecha__date__lte=end)

        # Generar CSV simple
        lines = ["id,producto,cantidad,total,fecha"]
        for v in qs:
            lines.append(
                f"{v.id},{v.producto.nombre},{v.cantidad},{v.total},{v.fecha.date()}"
            )

        resp = HttpResponse("\n".join(lines), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=ventas.csv"
        return resp
