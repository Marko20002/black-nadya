from modeltranslation.translator import TranslationOptions, register

from .models import Pharmacy


@register(Pharmacy)
class PharmacyTranslationOptions(TranslationOptions):
    fields = ('name', 'address')
