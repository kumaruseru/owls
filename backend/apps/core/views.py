from rest_framework import generics, permissions
from .models import SiteConfiguration
from .serializers import SiteConfigurationSerializer

class SiteConfigurationView(generics.RetrieveUpdateAPIView):
    """API view to retrieve or update the singleton site configuration."""
    serializer_class = SiteConfigurationSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_object(self):
        return SiteConfiguration.get_solo()
