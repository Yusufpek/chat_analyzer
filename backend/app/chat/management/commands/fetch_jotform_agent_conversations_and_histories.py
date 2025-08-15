from django.core.management.base import BaseCommand

from common.utils.jotform_api import JotFormAPIService
from common.models.user import User
from common.models.connection import Connection
from common.constants.sources import SOURCE_JOTFORM
from chat.models.conversation import Conversation, ChatMessage
from chat.utils.conversation import get_chat_messages, get_conversations


class Command(BaseCommand):
    help = "Fetch JotForm agent conversations"

    def add_arguments(self, parser):
        parser.add_argument(
            "--connection_id",
            type=str,
            required=True,
            help="The ID of the JotForm agent to fetch conversations for.",
        )

    def handle(self, *args, **options):
        user = User.objects.first()
        connection_id = options["connection_id"]
        connection = Connection.objects.filter(
            connection_type=SOURCE_JOTFORM, id=connection_id
        ).first()
        if not connection:
            self.stdout.write(self.style.ERROR("No JotForm connection found for user."))
            return

        config = connection.config
        agent_ids = [agent.get("agent_id") for agent in config.get("agents", [])]

        if not agent_ids:
            self.stdout.write(
                self.style.ERROR("No agents found in JotForm connection configuration.")
            )
            return
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Found {len(agent_ids)} agents in JotForm connection."
                )
            )

        service = JotFormAPIService(user=user)

        # Get Conversations
        conversation_ids = Conversation.objects.values_list("id", flat=True)
        new_conversation_ids = []

        conversations = []
        for agent_id in agent_ids:
            # request
            convs = get_conversations(service, agent_id, user.id, conversation_ids)
            if convs:
                conversations.extend(convs)
                new_conversation_ids.extend(
                    [conv.id for conv in convs if conv.id not in conversation_ids]
                )

        if conversations:
            Conversation.objects.bulk_create(conversations)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully fetched JotForm agent conversations, and {len(conversations)} conversations saved to the database."
                )
            )
        else:
            self.stdout.write(self.style.WARNING("No new conversations found to save."))

        # Get ChatMessages
        chat_messages_bulk = []
        chat_message_ids = ChatMessage.objects.values_list("id", flat=True)
        for new_chat_id in new_conversation_ids:
            chat_messages = get_chat_messages(
                service,
                agent_id,
                new_chat_id,
                chat_message_ids=chat_message_ids,
            )
            if chat_messages:
                chat_messages_bulk.extend(chat_messages)

        if chat_messages_bulk:
            ChatMessage.objects.bulk_create(chat_messages_bulk)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully fetched JotForm agent conversation history, and {len(chat_messages_bulk)} messages saved to the database."
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING("No new messages found in the conversation history.")
            )
