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
    # A distinct scope (rather than inheriting AnonRateThrottle's shared
    # "anon" scope) so request history here doesn't mix with — or get
    # crowded out by — plain browsing traffic on other endpoints. The rate
    # itself is configured via REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'].
    scope = 'inquiry'


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
