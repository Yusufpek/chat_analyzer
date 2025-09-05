import json
from .ai_service import AIService, EngineType


class ClaudeService(AIService):
    model = None

    def __init__(self, model: str = "claude-sonnet-4-20250514", max_tokens: int = 1024):
        super().__init__(EngineType.ANTHROPIC_CLAUDE, "v1/messages")
        self.headers["anthropic-version"] = "2023-06-01"
        self.model = model
        self.max_tokens = max_tokens

    def send_request(self, content):
        data = {
            "model": self.model,
            "max_tokens": self.max_tokens,
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
            if "content" not in response or not response["content"]:
                return "No content found in response."
            if "text" not in response["content"][0]:
                return "No text found in the content."
            return response["content"][0]["text"]
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

        prompt = f"""
        Here is a conversation between an AI assistant and a user.
        Analyze the sentiment of the user's messages and provide a summary of their emotional state.
        Focus only on the user's messages.
        {conversation_messages}
        Provide the sentiment analysis in the following format:
        {{
            "sentiment": "<SUPER_POSITIVE/POSITIVE/NEUTRAL/NEGATIVE/SUPER_NEGATIVE>",
            "details": "<brief explanation of the sentiment>"
        }}
        """

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

        prompt = f"""
        Here is a conversation between an AI assistant and a user.
        Analyze the conversation and assign the most appropriate label from the following options:
        {labels}
        {conversation_messages}
        Provide the label analysis in the following format:
        {{
            "label": "<assigned_label>",
            "details": "<brief explanation of the label>"
        }}
        """

        response = self.send_request(prompt)
        parsed_response = json.loads(self.parse_response(response))

        if "label" in parsed_response and "details" in parsed_response:
            return parsed_response["label"], parsed_response["details"]

        raise ValueError(
            "Unexpected response format from OpenAI API for label analysis."
        )

    def get_conversation_title(self, conversation_messages):
        if not conversation_messages:
            raise ValueError("No conversation messages provided for title extraction.")

        prompt = f"""
        Here is a conversation between a user and an AI assistant.
        Focus only on the user's messages and create a concise, descriptive title that summarizes the main topic or purpose of the conversation.
        Detect the language of the user's messages and generate the title in the same language.
        Conversation:\n{conversation_messages}
        Provide the title in the following format:
        {{
            "title": "<concise and descriptive title in the language of the messages up to 25 characters>",
            "details": "<brief explanation of the title>"
        }}
        """

        response = self.send_request(prompt)
        parsed_response = json.loads(response)

        if "title" in parsed_response and "details" in parsed_response:
            return parsed_response["title"], parsed_response["details"]

        raise ValueError(
            "Unexpected response format from OpenAI API for title extraction."
        )
