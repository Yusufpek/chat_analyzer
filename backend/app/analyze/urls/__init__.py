from analyze.urls.qdrant import qdrant_urlpatterns
from analyze.urls.ai import ai_urlpatterns

urlpatterns = [
    *qdrant_urlpatterns,
    *ai_urlpatterns,
]
