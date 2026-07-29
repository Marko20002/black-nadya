from django.contrib import admin

from .models import ContactMessage, OrderRequest


@admin.register(OrderRequest)
class OrderRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'city', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'phone', 'email', 'city')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'is_read', 'created_at')
    list_filter = ('is_read',)
    search_fields = ('name', 'email', 'message')
