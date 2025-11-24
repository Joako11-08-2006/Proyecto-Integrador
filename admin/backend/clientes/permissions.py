from rest_framework.permissions import BasePermission

class EsAdmin(BasePermission):
    """
    Permite acceso a Admin y SuperAdmin
    """
    def has_permission(self, request, view):
        user = request.user
        return hasattr(user, "cliente") and user.cliente.rol in ["Admin", "SuperAdmin"]


class EsSuperAdmin(BasePermission):
    """
    Solo SuperAdmin
    """
    def has_permission(self, request, view):
        user = request.user
        return hasattr(user, "cliente") and user.cliente.rol == "SuperAdmin"
