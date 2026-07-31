from django.contrib import admin
from modeltranslation.admin import TranslationAdmin

from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(TranslationAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name_en',)}


@admin.register(Product)
class ProductAdmin(TranslationAdmin):
    list_display = ('name', 'category', 'is_featured', 'is_active', 'created_at')
    list_filter = ('category', 'is_featured', 'is_active')
    search_fields = ('name_en', 'name_mk', 'name_sq', 'short_description_en')
    inlines = [ProductImageInline]
