from django.db import models


class SiteSettings(models.Model):
    """Singleton model holding the site-wide editable content."""

    hero_background_image = models.ImageField(upload_to='site/hero/', blank=True, null=True)
    hero_tagline = models.CharField(max_length=300, blank=True)
    logo_image = models.ImageField(upload_to='site/logo/', blank=True, null=True)

    about_us_text = models.TextField(blank=True, help_text='Rich text HTML from the admin WYSIWYG editor')
    about_us_image = models.ImageField(upload_to='site/about/', blank=True, null=True)

    contact_phone = models.CharField(max_length=50, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_address = models.CharField(max_length=300, blank=True)

    social_links = models.JSONField(default=dict, blank=True, help_text='e.g. {"instagram": "https://...", "facebook": "https://..."}')

    footer_text = models.CharField(max_length=300, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'site settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return 'Site Settings'
