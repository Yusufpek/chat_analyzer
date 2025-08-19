from common.base.base_command import CustomBaseCommand
from common.utils.jotform_api import JotFormAPIService
from common.models.connection import Connection
from common.models.agent import Agent
from common.constants.sources import SOURCE_JOTFORM
from chat.models.conversation import Conversation, ChatMessage
from chat.utils.jotform_conversation import (
    get_chat_messages,
    get_conversations,
)


class Command(CustomBaseCommand):
    help = "Fetch JotForm agent conversations"
    command_name = "fetch_jotform_agent_conversations_and_histories"

    def add_arguments(self, parser):
        parser.add_argument(
            "--connection_id",
            type=str,
            required=True,
            help="The ID of the JotForm agent to fetch conversations for.",
        )

    def process(self, *args, **options):
        connection_id = options["connection_id"]
        connection = Connection.objects.filter(
            connection_type=SOURCE_JOTFORM, id=connection_id
        ).first()
        if not connection:
            self.logger.error("No JotForm connection found for user.")
            return

        user = connection.user
        agent_ids = Agent.objects.filter(
            connection=connection,
        ).values_list("id", flat=True)

        if not agent_ids:
            self.logger.error("No agents found in JotForm connection configuration.")
            return
        else:
            self.logger.info(f"Found {len(agent_ids)} agents in JotForm connection.")

        service = JotFormAPIService(user=user)

        # Get Conversations
        conversation_ids = list(Conversation.objects.values_list("id", flat=True))
        new_conversation_ids = []

        conversations = []
        for agent_id in agent_ids:
            # request
            convs = get_conversations(
                service,
                agent_id,
                user.id,
                self.logger,
                conversation_ids,
            )
            if convs:
                conversations.extend(convs)
                new_conversation_ids.extend(
                    [conv.id for conv in convs if conv.id not in conversation_ids]
                )

        if conversations:
            Conversation.objects.bulk_create(conversations)
            self.logger.info(
                f"Successfully fetched JotForm agent conversations, and {len(conversations)} conversations saved to the database."
            )
        else:
            self.logger.warning("No new conversations found to save.")

        # Get ChatMessages
        chat_messages_bulk = []
        chat_message_ids = ChatMessage.objects.values_list("id", flat=True)
        conversation_ids.extend(new_conversation_ids)
        for new_chat_id in conversation_ids:
            chat_messages = get_chat_messages(
                service,
                agent_id,
                new_chat_id,
                self.logger,
                chat_message_ids=chat_message_ids,
            )
            if chat_messages:
                chat_messages_bulk.extend(chat_messages)

        if chat_messages_bulk:
            ChatMessage.objects.bulk_create(chat_messages_bulk)
            self.logger.info(
                f"Successfully fetched JotForm agent conversation history, and {len(chat_messages_bulk)} messages saved to the database."
            )
        else:
            self.logger.warning("No new messages found in the conversation history.")
