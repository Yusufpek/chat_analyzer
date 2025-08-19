from django.db import models
from analyze.utils.engine_types import EngineType
from common.models.http_log import HTTPServiceLogModel


class AIServiceLog(HTTPServiceLogModel):
    """
    Represents a log entry for AI service interactions.
    """

    service_engine = models.CharField(
        max_length=50,
        choices=EngineType.choices(),
        default=EngineType.OPENAI,
    )

    def __str__(self):
        return f"{self.service_engine} - {self.status_code} - {self.created_at}"
