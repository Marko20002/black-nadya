from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import Category, Product


class ProductPublicApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Serums')
        self.active_product = Product.objects.create(
            name_en='Radiance Serum', category=self.category, is_active=True,
        )
        Product.objects.create(name_en='Discontinued Serum', category=self.category, is_active=False)

    def test_list_only_returns_active_products(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, 200)
        names = [p['name_en'] for p in response.data]
        self.assertIn('Radiance Serum', names)
        self.assertNotIn('Discontinued Serum', names)

    def test_retrieve_by_slug(self):
        response = self.client.get(f'/api/products/{self.active_product.slug}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name_en'], 'Radiance Serum')

    def test_category_filter(self):
        other_category = Category.objects.create(name='Oils')
        Product.objects.create(name_en='Rosehip Oil', category=other_category, is_active=True)
        response = self.client.get('/api/products/', {'category': other_category.slug})
        self.assertEqual(response.status_code, 200)
        names = [p['name_en'] for p in response.data]
        self.assertEqual(names, ['Rosehip Oil'])


class ProductAdminApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_superuser('owner', 'owner@example.com', 'testpass123')

    def test_admin_endpoint_requires_auth(self):
        response = self.client.get('/api/admin/products/')
        self.assertEqual(response.status_code, 401)

    def test_admin_can_create_product(self):
        token_response = self.client.post(
            '/api/auth/token/', {'username': 'owner', 'password': 'testpass123'}, format='json',
        )
        self.assertEqual(token_response.status_code, 200)
        self.assertNotIn('access', token_response.data)
        self.assertIn('session_expires_at', token_response.data)
        # Tokens are set as httpOnly cookies now, not returned in the body —
        # the test client carries cookies across requests like a browser, so
        # no manual credentials() attachment is needed.
        response = self.client.post('/api/admin/products/', {'name_en': 'New Product'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Product.objects.filter(name_en='New Product').exists())
