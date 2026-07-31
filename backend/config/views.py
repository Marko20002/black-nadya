from datetime import datetime, timezone as dt_timezone

from django.conf import settings
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .auth_cookies import ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME


def _set_auth_cookie(response, name, value):
    response.set_cookie(
        name,
        str(value),
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path='/',
    )


class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Same credential check as TokenObtainPairView, but the access/refresh
    tokens are set as httpOnly cookies instead of being returned in the
    response body — so no script (ours or injected) can ever read them.
    The only thing exposed in the body is session_expires_at, a plain
    timestamp with no exploitable value on its own, used purely to drive
    the frontend's expiry-warning countdown.
    """

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0]) from e

        access = serializer.validated_data['access']
        refresh = serializer.validated_data['refresh']
        expires_at = datetime.fromtimestamp(int(RefreshToken(refresh)['exp']), tz=dt_timezone.utc)

        response = Response({'session_expires_at': expires_at.isoformat()})
        _set_auth_cookie(response, ACCESS_COOKIE_NAME, access)
        _set_auth_cookie(response, REFRESH_COOKIE_NAME, refresh)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    Reads the refresh token from the bn_refresh cookie (never the request
    body) and sets the newly issued access token back as the bn_access
    cookie. ROTATE_REFRESH_TOKENS is off, so bn_refresh itself is left
    untouched here — it keeps counting down to its original 24h expiry from
    login regardless of how often this endpoint is called.
    """

    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get(REFRESH_COOKIE_NAME)
        if not refresh:
            raise InvalidToken('No refresh token cookie found.')

        serializer = self.get_serializer(data={'refresh': refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0]) from e

        access = serializer.validated_data['access']
        response = Response({'detail': 'Access token refreshed.'})
        _set_auth_cookie(response, ACCESS_COOKIE_NAME, access)
        return response


class LogoutView(APIView):
    """
    Clears both auth cookies server-side. Open to any caller (not just
    authenticated ones) since an already-expired access token shouldn't be
    able to block someone from clearing stale cookies, and clearing cookies
    that don't exist is harmless.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        response = Response({'detail': 'Logged out.'})
        response.delete_cookie(ACCESS_COOKIE_NAME, path='/')
        response.delete_cookie(REFRESH_COOKIE_NAME, path='/')
        return response


class CsrfCookieView(APIView):
    """
    GET this once on app load. Returns the CSRF token in the response body
    (not just as a cookie) so the frontend can attach it as a header
    explicitly, rather than relying on axios reading the csrftoken cookie
    via document.cookie.

    That cookie-reading shortcut is the standard double-submit-cookie
    pattern, but it only works when the frontend and API share a
    browser-visible cookie scope (same site, or a shared parent domain with
    CSRF_COOKIE_DOMAIN set). Here the frontend (blacknadya.com) and API
    (Railway's own domain, no shared parent) don't, so a cookie the API sets
    is invisible to document.cookie on the frontend's origin even though the
    browser still attaches it correctly to requests — get_token() below both
    ensures the cookie is set for the server-side comparison and gives us
    the value to hand to JS directly, sidestepping that gap entirely.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        return Response({'csrfToken': get_token(request)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({
        'username': request.user.username,
        'email': request.user.email,
        'is_staff': request.user.is_staff,
    })
