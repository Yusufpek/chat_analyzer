import requests

from django.conf import settings
from analyze.models.ai_log import AIServiceLog
from .engine_types import EngineType


class AIService:
    engine = EngineType.OPENAI
    bearer_token = None
    base_url = None
    headers = {}

    def __init__(self, engine: EngineType, endpoint: str):
        self.base_url = f"{settings.AI_SERVICE_URL}{engine.value}/{endpoint}"
        self.bearer_token = settings.AI_SERVICE_TOKEN
        self.headers = {
            "Authorization": f"Bearer {self.bearer_token}",
            "Content-Type": "application/json",
        }

    def send_request(self, data):
        log = AIServiceLog.objects.create(
            service_engine=self.engine,
            request_payload=data,
            endpoint=self.base_url,
            http_method="POST",
            status=AIServiceLog.PENDING,
        )
        response = requests.post(self.base_url, headers=self.headers, json=data)

        if response.status_code not in [200, 201]:
            log.status = AIServiceLog.ERROR
            log.status_code = response.status_code
            try:
                log.response_payload = response.json()
            except ValueError:
                log.response_payload = response.text
            log.save()
            return response

        log.status = AIServiceLog.SUCCESS
        log.status_code = response.status_code
        log.response_payload = response.json()
        log.save()
        return self.parse_response(response.json())

    def parse_response(self, response):
        """
        Parses the response from the AI service.
        This method can be overridden by subclasses to handle specific response formats.
        """
        return response

    def sentimental_analysis(self, conversation_messages: str):
        """
        Performs sentiment analysis on the provided conversation messages.
        This method should be implemented by subclasses.
        """
        raise NotImplementedError("Subclasses must implement this method.")
