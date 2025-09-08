from chat.urls.conversation import conversation_urlpatterns
from chat.urls.admin import admin_urlpatterns

urlpatterns = [
    *conversation_urlpatterns,
    *admin_urlpatterns,
]
