from modeltranslation.translator import TranslationOptions, register

from .models import Category, Product


@register(Product)
class ProductTranslationOptions(TranslationOptions):
    fields = ('name', 'short_description', 'full_description', 'ingredients')


@register(Category)
class CategoryTranslationOptions(TranslationOptions):
    fields = ('name',)
