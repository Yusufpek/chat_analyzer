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

    def sentimental_analysis(self, chat_messages: str):
        """
        Performs sentiment analysis on the provided text using the Replicate service.
        :param chat_messages: The text to analyze.
        :return: A tuple containing the sentiment label and score.
        :rtype: tuple(str, float)
        """
        if not chat_messages:
            raise ValueError("No chat messages provided for sentiment analysis.")

        self.version = "curt-park/sentiment-analysis:49d8f5a887de5668d4333ca1ed520002d2c52a1355d2fdb02a4d41850768a19a"
        input_data = {
            "text": chat_messages,
        }
        response = self.send_request(input_data)
        parsed_response = self.parse_response(response)
        if "label" in parsed_response and "score" in parsed_response:
            return parsed_response["label"], parsed_response["score"]
        raise ValueError(
            "Unexpected response format from replicate sentiment analysis."
        )
