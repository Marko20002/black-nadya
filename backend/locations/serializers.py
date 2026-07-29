from rest_framework import serializers

from .models import Pharmacy


class PharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = ['id', 'name', 'address', 'city', 'phone', 'map_link', 'is_active']
