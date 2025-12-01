from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Cliente
from .serializers import ClienteSerializer
from clientes.permissions import EsSuperAdmin

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated, EsSuperAdmin]


class PerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cliente = getattr(request.user, "cliente", None)
        if request.user.is_superuser:
            rol = "SuperAdmin"
        else:
            rol = getattr(cliente, "rol", "Cliente") if cliente else "Cliente"

        return Response(
            {
                "id": cliente.id if cliente else None,
                "username": request.user.username,
                "email": request.user.email,
                "rol": rol,
            }
        )
