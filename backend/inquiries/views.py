from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.throttling import AnonRateThrottle

from .models import ContactMessage, OrderRequest
from .serializers import (
    ContactMessageAdminSerializer,
    ContactMessageCreateSerializer,
    OrderRequestAdminSerializer,
    OrderRequestCreateSerializer,
)


class InquiryCreateThrottle(AnonRateThrottle):
    rate = '10/hour'


class OrderRequestCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = OrderRequest.objects.all()
    serializer_class = OrderRequestCreateSerializer
    throttle_classes = [InquiryCreateThrottle]


class ContactMessageCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageCreateSerializer
    throttle_classes = [InquiryCreateThrottle]


class OrderRequestAdminViewSet(viewsets.ModelViewSet):
    queryset = OrderRequest.objects.all()
    serializer_class = OrderRequestAdminSerializer
    permission_classes = [IsAdminUser]


class ContactMessageAdminViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageAdminSerializer
    permission_classes = [IsAdminUser]
