"""Shared constants for the httpOnly admin auth cookies.

Kept in one place since the login/refresh/logout views and the cookie
authentication class all need to agree on the exact same names.
"""

ACCESS_COOKIE_NAME = 'bn_access'
REFRESH_COOKIE_NAME = 'bn_refresh'
