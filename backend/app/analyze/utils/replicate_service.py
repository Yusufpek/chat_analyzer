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
        print(f"Sending request to Replicate with data: {data}")
        return super().send_request(data)

    def get_prediction_result(self, prediction_id):
        """
        Fetches the prediction result from the provided URL.
        """
        try:
            url = f"{self.base_url}/{prediction_id}/"
            log = AIServiceLog.objects.create(
                service_engine=self.engine,
                request_payload={},
                status=AIServiceLog.PENDING,
                http_method="GET",
                endpoint=url,
            )
            response = requests.get(url, headers=self.headers)
            log.response_payload = response.json()
            if response.status_code == 200:
                log.status = AIServiceLog.SUCCESS
                log.status_code = response.status_code
                log.save()
                return response.json()
            else:
                log.status = AIServiceLog.ERROR
                log.status_code = response.status_code
                log.save()
                return f"Error fetching result: {response.status_code}"
        except requests.RequestException as e:
            return f"Request error: {str(e)}"

    def parse_response(self, response):
        """
        Parses the response from the Replicate service.
        """
        print("PARSE REPLICATE RESPONSE")
        if "id" in response:
            prediction_id = response["id"]
            response = self.get_prediction_result(prediction_id)
            return response
        return response
