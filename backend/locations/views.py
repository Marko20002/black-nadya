from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from .models import Pharmacy
from .serializers import PharmacySerializer


class PharmacyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Pharmacy.objects.filter(is_active=True)
    serializer_class = PharmacySerializer


class PharmacyAdminViewSet(viewsets.ModelViewSet):
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer
    permission_classes = [IsAdminUser]
