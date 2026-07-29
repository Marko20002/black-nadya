from rest_framework import serializers

from .models import Pharmacy

TRANSLATED_FIELDS = [
    'name_en', 'name_mk', 'name_sq',
    'address_en', 'address_mk', 'address_sq',
]


class PharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = ['id', 'city', 'phone', 'map_link', 'is_active', *TRANSLATED_FIELDS]

    def validate_name_en(self, value):
        if not value.strip():
            raise serializers.ValidationError('English name is required as the fallback.')
        return value
