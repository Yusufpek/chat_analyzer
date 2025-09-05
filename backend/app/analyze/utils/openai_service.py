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
        parsed_response = json.loads(response)

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
        parsed_response = json.loads(response)

        if "label" in parsed_response and "details" in parsed_response:
            return parsed_response["label"], parsed_response["details"]

        raise ValueError(
            "Unexpected response format from OpenAI API for label analysis."
        )

    def context_change_analysis(self, conversation_messages):
        if not conversation_messages:
            raise ValueError(
                "No conversation messages provided for sentiment analysis."
            )

        prompt = f"""
        Here is a conversation between a user and an AI assistant. Analyze the conversation to determine the following:

        1. The overall context of the conversation.
        2. The main topics discussed during the conversation.
        3. Identify where the context of the conversation changed (if any), and describe the transitions between topics.
        4. Focus on user messages

        Provide the analysis in the following structured format:
        {{
            "overall_context": "<brief summary of the overall context>",
            "topics": [
            {{
                "topic": "<name of the topic>",
                "details": "<brief explanation of the topic>",
                "start_message": "<index or content of the message where the topic starts>",
                "end_message": "<index or content of the message where the topic ends>"
            }},
            ],
            "context_changes": [
                {{
                "from_topic": "<name of the previous topic>",
                    "to_topic": "<name of the new topic>",
                    "change_message": "<index or content of the message where the context changed>",
                    "details": "<brief explanation of the context change>"
                }},
            ]
        }}
        Conversation:
        {conversation_messages}

        Provide the analysis in JSON format.
        """

        response = self.send_request(prompt)
        if "json" in response:
            response = response.replace("json", "").replace("```", "").strip()
        parsed_response = json.loads(response)

        if any(
            key in parsed_response
            for key in ["overall_context", "topics", "context_changes"]
        ):
            return (
                parsed_response["overall_context"],
                parsed_response["topics"],
                parsed_response["context_changes"],
            )

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
