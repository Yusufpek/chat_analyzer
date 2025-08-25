from common.base.base_command import CustomBaseCommand
from common.utils.jotform_api import JotFormAPIService
from common.models.connection import Agent
from chat.models.conversation import ChatMessage, Conversation
from chat.utils.jotform_conversation import get_chat_messages, get_conversations


class Command(CustomBaseCommand):
    help = "Fetch JotForm agent conversations"
    command_name = "fetch_jotform_agent_conversations"

    def add_arguments(self, parser):
        parser.add_argument(
            "--agent_id",
            type=str,
            required=True,
            help="The ID of the JotForm agent to fetch conversations for.",
        )

    def process(self, *args, **options):
        agent_id = options["agent_id"]
        agent = Agent.objects.filter(id=agent_id).first()
        if not agent:
            self.logger.error("No JotForm agent found with the provided ID.")
            return
        connection = agent.connection

        if not connection:
            self.logger.error("No JotForm connection found for user.")
            return

        user = connection.user
        service = JotFormAPIService(user=user)
        conversation_ids = Conversation.objects.filter(
            user=user,
            agent_id=agent_id,
        ).values_list("id", flat=True)
        conversations = get_conversations(
            service,
            agent_id,
            user.id,
            self.logger,
            conversation_ids=conversation_ids,
        )

        if conversations:
            Conversation.objects.bulk_create(conversations)
            self.logger.info(
                f"Successfully fetched JotForm agent conversations, and {len(conversations)} conversations saved to the database."
            )
        else:
            self.logger.warning("No new conversations found to save.")

        chat_messages = []
        for conv in conversations:
            chat_messages.extend(
                get_chat_messages(service, agent_id, conv.id, self.logger)
            )

        if chat_messages:
            ChatMessage.objects.bulk_create(chat_messages)
            self.logger.info(
                f"Successfully fetched JotForm agent conversation history, and {len(chat_messages)} messages saved to the database."
            )
        else:
            self.logger.warning("No new messages found in the conversation history.")
