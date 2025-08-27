import json
from .ai_service import AIService, EngineType


class OpenAIService(AIService):
    """
    Service class for interacting with OpenAI's API.
    """

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

    def sentimental_analysis(self, conversation_messages):
        """
        Performs sentiment analysis on the provided conversation messages using OpenAI's API.
        :param conversation_messages: List of messages in the conversation.
        :return: A tuple containing the sentiment label and details.
        :rtype: tuple(str, str)
        """
        if not conversation_messages:
            raise ValueError(
                "No conversation messages provided for sentiment analysis."
            )

        prompt = (
            "Here is a conversation between an AI assistant and a user. "
            "Analyze the sentiment of the user's messages and provide a summary of their emotional state. "
            "Focus only on the user's messages.\n\n"
            f"{conversation_messages}\n\n"
            "Provide the sentiment analysis in the following format:\n"
            "{\n"
            '  "sentiment": "<SUPER_POSITIVE/POSITIVE/NEUTRAL/NEGATIVE/SUPER_NEGATIVE>",\n'
            '  "details": "<brief explanation of the sentiment>"\n'
            "}"
        )

        response = self.send_request(prompt)
        parsed_response = json.loads(self.parse_response(response))

        if "sentiment" in parsed_response and "details" in parsed_response:
            return parsed_response["sentiment"], parsed_response["details"]

        raise ValueError(
            "Unexpected response format from OpenAI API for sentiment analysis."
        )

    def label_analysis(self, conversation_messages: str, labels: str):
        """
        Performs label analysis on the provided conversation messages.
        :param conversation_messages: The conversation messages to analyze.
        :param labels: A list of possible labels to classify the conversation.
        :return: A tuple containing the assigned label and details.
        """
        if not conversation_messages:
            raise ValueError("No conversation messages provided for label analysis.")

        prompt = (
            "Here is a conversation between an AI assistant and a user. "
            "Analyze the conversation and assign the most appropriate label from the following options:\n"
            f"{labels}\n\n"
            "Focus on the user's messages.\n\n"
            f"{conversation_messages}\n\n"
            "Provide the label analysis in the following format:\n"
            "{\n"
            '  "label": "<assigned_label>",\n'
            '  "details": "<brief explanation of the label>"\n'
            "}"
        )

        response = self.send_request(prompt)
        parsed_response = json.loads(self.parse_response(response))

        if "label" in parsed_response and "details" in parsed_response:
            return parsed_response["label"], parsed_response["details"]

        raise ValueError(
            "Unexpected response format from OpenAI API for label analysis."
        )
