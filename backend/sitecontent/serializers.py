from rest_framework import serializers

from .models import SiteSettings

TRANSLATED_FIELDS = [
    'hero_tagline_en', 'hero_tagline_mk', 'hero_tagline_sq',
    'about_us_text_en', 'about_us_text_mk', 'about_us_text_sq',
    'contact_address_en', 'contact_address_mk', 'contact_address_sq',
    'footer_text_en', 'footer_text_mk', 'footer_text_sq',
]


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'id', 'hero_background_image', 'logo_image',
            'about_us_image', 'contact_phone', 'contact_email',
            'social_links', 'updated_at',
            *TRANSLATED_FIELDS,
        ]
        read_only_fields = ['id', 'updated_at']
