from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('config/', views.SiteConfigurationView.as_view(), name='site-config'),
]
