import requests
from analyze.models.ai_log import AIServiceLog
from .ai_service import AIService, EngineType


class ReplicateService(AIService):
    version = None

    def __init__(
        self,
        version: str = "replicate/hello-world:5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
    ):
        super().__init__(EngineType.REPLICATE, "v1/predictions")
        self.version = version

    def send_request(self, input_data: dict):
        """
        Sends a request to the Replicate service with the specified input data.
        """
        data = {
            "version": self.version,
            "input": input_data,
        }
        return super().send_request(data)

    def parse_response(self, response):
        """
        Parses the response from the Replicate service.
        """
        if "urls" in response and "get" in response["urls"]:
            try:
                log = AIServiceLog.objects.create(
                    service_engine=self.engine,
                    request_payload=f"GET {response['urls']['get']}",
                    status=AIServiceLog.PENDING,
                )
                get_response = requests.get(response["urls"]["get"])
                log.response_payload = get_response.json()
                if get_response.status_code == 200:
                    log.status = AIServiceLog.SUCCESS
                    log.status_code = get_response.status_code
                    log.save()
                    return get_response.json()
                else:
                    return f"Error fetching result: {get_response.status_code}"
            except requests.RequestException as e:
                return f"Request error: {str(e)}"
