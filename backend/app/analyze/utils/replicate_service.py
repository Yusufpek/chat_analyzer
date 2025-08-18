from .ai_service import AIService, EngineType


class ReplicateService(AIService):
    version = None

    def __init__(
        self,
        version: str = "replicate/hello-world:5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
    ):
        super().__init__(EngineType.REPLICATE, "v1/predictions")
        self.version = version
        self.headers["Prefer"] = "wait"

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
        if "output" in response:
            return response.get("output")
        if "error" in response:
            return {"error": response.get("error")}
        return response
