from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from clientes.permissions import EsAdmin
from .models import Comprobante
from .serializers import (
    ComprobanteCreateSerializer,
    ComprobanteDetailSerializer,
)


class ComprobanteViewSet(viewsets.ModelViewSet):
    queryset = Comprobante.objects.all().order_by("-fecha")
    permission_classes = [IsAuthenticated, EsAdmin]

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return ComprobanteDetailSerializer
        if self.action == "create":
            return ComprobanteCreateSerializer
        return ComprobanteCreateSerializer

    @action(detail=True, methods=["patch"])
    def estado(self, request, pk=None):
        comp = self.get_object()
        estado = request.data.get("estado")
        if estado in ["PENDIENTE", "PAGADO"]:
            comp.estado = estado
            comp.save(update_fields=["estado"])
        return Response({"estado": comp.estado})
