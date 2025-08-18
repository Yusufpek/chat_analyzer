from .ai_service import AIService, EngineType


class OpenAIService(AIService):
    model = None

    def __init__(self, model: str = "gpt-4o-mini"):
        super().__init__(EngineType.OPENAI, "v1/chat/completions")
        self.model = model

    def send_request(self, content):
        data = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": content,
                },
            ],
        }

        return super().send_request(data)

    def parse_response(self, response):
        """
        Parses the response from the OpenAI service.
        This method can be overridden by subclasses to handle specific response formats.
        """
        try:
            if not isinstance(response, dict):
                return response
            if "choices" not in response or not response["choices"]:
                return "No choices found in response."
            if "message" not in response["choices"][0]:
                return "No message found in the first choice."
            if "content" not in response["choices"][0]["message"]:
                return "No content found in the message."
            return response["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Error parsing response: {e}")
        return response
