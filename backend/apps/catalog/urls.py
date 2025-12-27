from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'catalog'

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category') # /categories/, /categories/{slug}/
router.register(r'products', views.ProductViewSet, basename='product') # /products/, /products/{slug}/, /products/filters/
router.register(r'products/admin', views.AdminProductViewSet, basename='admin-product') # /products/admin/, /products/admin/{pk}/

# Custom Router for Image Action to match old path structure roughly or cleaner
# Old path: products/images/<int:pk>/set-primary/
# New ViewSet Action: set_primary on detail=True.
# We can register a simple viewset or just use the ViewSet as a standalone view for this specific weird path if needed, 
# but best is to register it.
router.register(r'products/images', views.AdminProductImageViewSet, basename='product-image')
# This gives /products/images/{pk}/set_primary/ (underscores usually by default)
# We can customize this via @action(url_path='set-primary') which is done.

urlpatterns = [
    path('', include(router.urls)),
]
