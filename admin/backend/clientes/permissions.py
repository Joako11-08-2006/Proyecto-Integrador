from rest_framework.permissions import BasePermission

class EsAdmin(BasePermission):
    """
    Permite acceso a Admin y SuperAdmin
    """
    def has_permission(self, request, view):
        user = request.user
        if user.is_superuser:
            return True
        cliente = getattr(user, "cliente", None)
        return cliente and cliente.rol in ["Admin", "SuperAdmin"]


class EsSuperAdmin(BasePermission):
    """
    Solo SuperAdmin
    """
    def has_permission(self, request, view):
        user = request.user
        if user.is_superuser:
            return True
        cliente = getattr(user, "cliente", None)
        return cliente and cliente.rol == "SuperAdmin"
