from rest_framework.test import APITestCase

from .models import ContactMessage, OrderRequest


class InquiryPublicApiTests(APITestCase):
    def test_can_submit_order_request(self):
        payload = {
            'name': 'Jane Doe',
            'phone': '+389 70 000 000',
            'products_wanted': 'Radiance Serum',
        }
        response = self.client.post('/api/order-requests/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(OrderRequest.objects.count(), 1)
        self.assertEqual(OrderRequest.objects.first().status, 'new')

    def test_can_submit_contact_message(self):
        payload = {'name': 'Jane Doe', 'email': 'jane@example.com', 'message': 'Hello!'}
        response = self.client.post('/api/contact-messages/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_order_request_admin_endpoint_requires_auth(self):
        response = self.client.get('/api/admin/order-requests/')
        self.assertEqual(response.status_code, 401)
