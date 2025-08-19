from rest_framework import routers

from .connection import connection_urlpatterns
from .health import health_urlpatterns
from .auth import auth_urlpatterns
from .agent import agent_urlpatterns

router = routers.SimpleRouter()
# router.register(r"users", UserViewSet, basename="users")

urlpatterns = [
    *router.urls,
    *connection_urlpatterns,
    *agent_urlpatterns,
    *health_urlpatterns,
    *auth_urlpatterns,
]
