from rest_framework.test import APITestCase

from .models import SiteSettings


class SiteSettingsPublicApiTests(APITestCase):
    def test_returns_singleton_settings(self):
        SiteSettings.load()
        response = self.client.get('/api/site-settings/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('hero_tagline_en', response.data)

    def test_admin_endpoint_requires_auth(self):
        response = self.client.get('/api/admin/site-settings/')
        self.assertEqual(response.status_code, 401)
