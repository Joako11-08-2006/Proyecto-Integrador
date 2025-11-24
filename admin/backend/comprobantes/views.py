from rest_framework.permissions import IsAuthenticated
from clientes.permissions import EsAdmin
from .models import Comprobante
from .serializers import ComprobanteSerializer
from rest_framework import viewsets

class ComprobanteViewSet(viewsets.ModelViewSet):
    queryset = Comprobante.objects.all()
    serializer_class = ComprobanteSerializer
    permission_classes = [IsAuthenticated, EsAdmin]
