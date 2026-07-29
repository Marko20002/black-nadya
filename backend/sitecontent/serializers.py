from rest_framework import serializers

from .models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'id', 'hero_background_image', 'hero_tagline', 'logo_image',
            'about_us_text', 'about_us_image', 'contact_phone',
            'contact_email', 'contact_address', 'social_links',
            'footer_text', 'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']
