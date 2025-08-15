from rest_framework import routers

from .connection import connection_urlpatterns
from .health import health_urlpatterns

router = routers.SimpleRouter()
# router.register(r"users", UserViewSet, basename="users")

urlpatterns = [
    *router.urls,
    *connection_urlpatterns,
    *health_urlpatterns,
]
