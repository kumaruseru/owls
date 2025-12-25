from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('', views.OrderListView.as_view(), name='order_list'),
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('<str:order_number>/', views.OrderDetailView.as_view(), name='order_detail'),
    path('<str:order_number>/cancel/', views.CancelOrderView.as_view(), name='cancel_order'),
    
    # Admin URLs
    path('admin/all/', views.AdminOrderListView.as_view(), name='admin_order_list'),
    path('admin/stats/', views.AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
    path('admin/<str:order_number>/', views.AdminOrderDetailView.as_view(), name='admin_order_detail'),
]
