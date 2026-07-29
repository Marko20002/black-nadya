from modeltranslation.translator import TranslationOptions, register

from .models import SiteSettings


@register(SiteSettings)
class SiteSettingsTranslationOptions(TranslationOptions):
    fields = ('hero_tagline', 'about_us_text', 'contact_address', 'footer_text')
