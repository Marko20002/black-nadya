from rest_framework.test import APITestCase

from .models import Pharmacy


class PharmacyPublicApiTests(APITestCase):
    def setUp(self):
        Pharmacy.objects.create(name='Vita Pharmacy', address='Ul. 1', city='Skopje', is_active=True)
        Pharmacy.objects.create(name='Closed Pharmacy', address='Ul. 2', city='Skopje', is_active=False)

    def test_list_only_returns_active_pharmacies(self):
        response = self.client.get('/api/pharmacies/')
        self.assertEqual(response.status_code, 200)
        names = [p['name'] for p in response.data]
        self.assertIn('Vita Pharmacy', names)
        self.assertNotIn('Closed Pharmacy', names)
