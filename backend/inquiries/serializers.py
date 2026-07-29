from rest_framework import serializers

from .models import ContactMessage, OrderRequest


class OrderRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderRequest
        fields = ['name', 'phone', 'email', 'city', 'address', 'products_wanted', 'notes']


class OrderRequestAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderRequest
        fields = '__all__'
        read_only_fields = ['created_at']


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'message']


class ContactMessageAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['created_at']
