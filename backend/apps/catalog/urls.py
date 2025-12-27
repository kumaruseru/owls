from django.urls import path
from . import views

app_name = 'catalog'

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('categories/<slug:slug>/', views.CategoryDetailView.as_view(), name='category_detail'),
    path('products/', views.ProductListView.as_view(), name='product_list'),
    path('products/filters/', views.ProductFilterView.as_view(), name='product_filters'),
    # Admin
    path('products/admin/', views.AdminProductListView.as_view(), name='admin_product_list'),
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('products/admin/<uuid:pk>/', views.AdminProductDetailView.as_view(), name='admin_product_detail'),
    path('products/images/<int:pk>/set-primary/', views.AdminProductImageSetPrimaryView.as_view(), name='admin_image_set_primary'),
]
