from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from .models import SiteSettings
from .serializers import SiteSettingsSerializer


class SiteSettingsPublicView(generics.RetrieveAPIView):
    serializer_class = SiteSettingsSerializer

    def get_object(self):
        return SiteSettings.load()


class SiteSettingsAdminView(generics.RetrieveUpdateAPIView):
    serializer_class = SiteSettingsSerializer
    permission_classes = [IsAdminUser]

    def get_object(self):
        return SiteSettings.load()
