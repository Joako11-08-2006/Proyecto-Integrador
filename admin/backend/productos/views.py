from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from clientes.permissions import EsAdmin
from .models import Producto, Categoria, Alerta
from .serializers import ProductoSerializer, CategoriaSerializer, AlertaSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by('nombre')
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated, EsAdmin]


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().order_by('nombre')
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated, EsAdmin]


class AlertaViewSet(viewsets.ModelViewSet):
    queryset = Alerta.objects.all().order_by('-creado_en')
    serializer_class = AlertaSerializer
    permission_classes = [IsAuthenticated, EsAdmin]


# --------- Endpoints HU-03 ---------

class AlertListAPIView(generics.ListAPIView):
    serializer_class = AlertaSerializer
    permission_classes = [IsAuthenticated, EsAdmin]

    def get_queryset(self):
        return Alerta.objects.filter(visto=False).order_by('-creado_en')


class AlertMarkSeenAPIView(generics.UpdateAPIView):
    serializer_class = AlertaSerializer
    permission_classes = [IsAuthenticated, EsAdmin]
    queryset = Alerta.objects.all()

    def patch(self, request, *args, **kwargs):
        alerta = self.get_object()
        alerta.visto = True
        alerta.save()
        return Response(AlertaSerializer(alerta).data, status=status.HTTP_200_OK)
