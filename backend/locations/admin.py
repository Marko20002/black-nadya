from django.contrib import admin
from modeltranslation.admin import TranslationAdmin

from .models import Pharmacy


@admin.register(Pharmacy)
class PharmacyAdmin(TranslationAdmin):
    list_display = ('name', 'city', 'phone', 'is_active')
    list_filter = ('city', 'is_active')
    search_fields = ('name_en', 'name_mk', 'name_sq', 'city')
