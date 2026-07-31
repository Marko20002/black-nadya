import logging

from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication

from .auth_cookies import ACCESS_COOKIE_NAME

logger = logging.getLogger('django.security.csrf')


class CookieJWTAuthentication(JWTAuthentication):
    """
    Reads the JWT access token from the httpOnly bn_access cookie set by the
    admin login/refresh views, falling back to the standard Authorization
    header (e.g. for scripts/tooling) when the cookie isn't present.

    Cookie-based auth additionally enforces CSRF validation, the same way
    DRF's SessionAuthentication does: browsers attach cookies to requests
    automatically (unlike an Authorization header, which a page can only set
    via JS it controls), so without this a malicious site could make
    state-changing requests riding an admin's authenticated cookie. Requests
    authenticated via the Authorization header instead — no ambient cookie
    involved — skip this check, matching JWTAuthentication's normal
    behavior.
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get(ACCESS_COOKIE_NAME)
        from_cookie = raw_token is not None

        if not from_cookie:
            header = self.get_header(request)
            if header is None:
                return None
            raw_token = self.get_raw_token(header)
            if raw_token is None:
                return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        if from_cookie:
            self.enforce_csrf(request)

        return user, validated_token

    def enforce_csrf(self, request):
        def dummy_get_response(request):  # pragma: no cover
            return None

        check = CSRFCheck(dummy_get_response)
        # populates request.META['CSRF_COOKIE'], which is used in process_view()
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            # DRF's CSRFCheck overrides _reject() to return the reason string
            # instead of an HttpResponse, which means it never calls Django's
            # own log_response()/django.security.csrf logging — so without
            # this, CSRF failures on this path were invisible in Railway's
            # logs even with DEBUG=False's console-logging gate removed.
            logger.warning(
                'CSRF check failed for %s %s (content-type=%s): %s',
                request.method, request.path, request.content_type, reason,
            )
            raise PermissionDenied(f'CSRF Failed: {reason}')
