from common.models.connection import Connection
from common.constants.sources import (
    JOTFORM_API_BASE_URL,
    SOURCE_JOTFORM,
)

import requests
import json


class JotFormAPIService:
    """
    Service class to interact with JotForm API.
    """

    user = None
    api_key = None
    config = None

    def __init__(self, user, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user
        connection = Connection.objects.filter(
            user=self.user,
            connection_type=SOURCE_JOTFORM,
        ).first()
        if not connection:
            raise ValueError("No JotForm connection found for user.")
        self.connection = connection
        self.config = connection.config
        self.api_key = connection.api_key

    def get_user_details(self):
        """
        Retrieve user details from JotForm API.
        """

        if not self.api_key:
            return 100, {
                "error": "No JotForm connection found for user.",
            }

        response = requests.get(
            f"{JOTFORM_API_BASE_URL}/user",
            params={"apiKey": self.api_key},
        )
        data = response.json()
        response_code = data.get("responseCode", response.status_code)
        return response_code, data

    def get_agent_conversations(self, agent_id, filter=None):
        """
        Retrieve chat history for a specific chat ID from JotForm API.
        :param chat_id: The ID of the chat to fetch history for.
        :return: A tuple containing the response code and content.
        Example of filter:
        {
            "updated_at:gt": "2025-08-12 09:52:40"
        }
        """
        if not self.api_key:
            return 100, {
                "error": "No JotForm connection found for user.",
            }

        url = f"{JOTFORM_API_BASE_URL}/ai-agent/agent/{agent_id}/conversations"
        response = requests.get(
            url,
            params={
                "apiKey": self.api_key,
                "orderby": "created_at,asc",
                "filter": json.dumps(filter) if filter else None,
                "limit": 500,
            },
        )
        try:
            data = response.json()
            response_code = data.get("responseCode", response.status_code)
            if response_code != 200:
                return response_code, {
                    "error": data.get("message", "Unknown error"),
                }

            return response_code, data.get("content", [])
        except ValueError:
            return response.status_code, {
                "error": response.text,
            }

    def get_chat_history(
        self,
        agent_id="",
        chat_id="",
    ):
        """
        Retrieve chats for a specific agent from JotForm API.
        param agent_id: The ID of the JotForm agent.
        param chat_id: The ID of the chat to fetch history for.
        :return: A tuple containing the response code and content.
        :rtype: tuple(int, dict)
        """
        if not self.api_key:
            return 100, {
                "error": "No JotForm connection found for user.",
            }
        url = f"{JOTFORM_API_BASE_URL}/ai-agent/{agent_id}/chat/{chat_id}/history"
        response = requests.get(
            url,
            params={
                "apiKey": self.api_key,
                "orderby": "created_at,asc",
                "limit": 500,
            },
        )
        try:
            data = response.json()
            response_code = data.get("responseCode", response.status_code)
            if response_code != 200:
                return response_code, {
                    "error": data.get("message", "Unknown error"),
                }

            return response_code, data.get("content", [])
        except ValueError:
            return response.status_code, {
                "error": response.text,
            }
