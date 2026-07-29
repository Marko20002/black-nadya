from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from inquiries.views import (
    ContactMessageAdminViewSet,
    ContactMessageCreateViewSet,
    OrderRequestAdminViewSet,
    OrderRequestCreateViewSet,
)
from locations.views import PharmacyAdminViewSet, PharmacyViewSet
from products.views import (
    CategoryAdminViewSet,
    CategoryViewSet,
    ProductAdminViewSet,
    ProductImageAdminViewSet,
    ProductViewSet,
)
from sitecontent.views import SiteSettingsAdminView, SiteSettingsPublicView

from .views import current_user

public_router = DefaultRouter()
public_router.register('products', ProductViewSet, basename='product')
public_router.register('categories', CategoryViewSet, basename='category')
public_router.register('pharmacies', PharmacyViewSet, basename='pharmacy')
public_router.register('order-requests', OrderRequestCreateViewSet, basename='order-request')
public_router.register('contact-messages', ContactMessageCreateViewSet, basename='contact-message')

admin_router = DefaultRouter()
admin_router.register('products', ProductAdminViewSet, basename='admin-product')
admin_router.register('product-images', ProductImageAdminViewSet, basename='admin-product-image')
admin_router.register('categories', CategoryAdminViewSet, basename='admin-category')
admin_router.register('pharmacies', PharmacyAdminViewSet, basename='admin-pharmacy')
admin_router.register('order-requests', OrderRequestAdminViewSet, basename='admin-order-request')
admin_router.register('contact-messages', ContactMessageAdminViewSet, basename='admin-contact-message')

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/site-settings/', SiteSettingsPublicView.as_view(), name='site-settings'),
    path('api/', include(public_router.urls)),

    path('api/auth/token/', TokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('api/auth/me/', current_user, name='current-user'),

    path('api/admin/site-settings/', SiteSettingsAdminView.as_view(), name='admin-site-settings'),
    path('api/admin/', include(admin_router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
