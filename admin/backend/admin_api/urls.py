from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path
from django.views.static import serve
from rest_framework.routers import DefaultRouter

from productos.views import (
    ProductoViewSet,
    CategoriaViewSet,
    AlertaViewSet,
    AlertListAPIView,
    AlertMarkSeenAPIView,
    PromocionViewSet,
)
from clientes.views import ClienteViewSet, PerfilView
from ventas.views import (
    VentaViewSet,
    VentaStatsAPIView,
    VentaReportAPIView,
    VentaCSVExportAPIView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'productos', ProductoViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'alertas', AlertaViewSet, basename='alerta')
router.register(r'promociones', PromocionViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'ventas', VentaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Endpoints específicos de alertas (HU-03)
    path('api/alertas/no-vistas/', AlertListAPIView.as_view(), name='alertas_no_vistas'),
    path('api/alertas/<int:pk>/visto/', AlertMarkSeenAPIView.as_view(), name='alerta_visto'),

    # Reportes y estadísticas de ventas (HU-12/13/14)
    path('api/ventas/stats/', VentaStatsAPIView.as_view(), name='ventas_stats'),
    path('api/ventas/report/', VentaReportAPIView.as_view(), name='ventas_report'),
    path('api/ventas/export/', VentaCSVExportAPIView.as_view(), name='ventas_export'),

    # API REST principal
    path('api/', include(router.urls)),
    path('api/me/', PerfilView.as_view(), name='perfil'),
]

# Servir archivos de media (imágenes de productos) siempre
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# Fallback explícito (en caso de que static devuelva lista vacía)
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
