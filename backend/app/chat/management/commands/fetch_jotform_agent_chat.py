from common.base.base_command import CustomBaseCommand
from common.utils.jotform_api import JotFormAPIService
from common.models.user import User
from chat.models.conversation import ChatMessage, Conversation
from chat.utils.jotform_conversation import get_chat_messages


class Command(CustomBaseCommand):
    help = "Fetch JotForm agent conversation history"
    command_name = "fetch_jotform_agent_chat"

    def add_arguments(self, parser):
        parser.add_argument(
            "--agent_id",
            type=str,
            required=True,
            help="The ID of the JotForm agent to fetch conversations for.",
        )
        parser.add_argument(
            "--chat_id",
            type=str,
            required=True,
            help="The ID of the chat to fetch conversation history for.",
        )

    def process(self, *args, **options):
        user = User.objects.first()
        agent_id = options["agent_id"]
        chat_id = options["chat_id"]

        if not Conversation.objects.filter(id=chat_id).exists():
            Conversation.objects.create(
                user_id=user.id,
                id=chat_id,
                agent_id=agent_id,
                chat_type=Conversation.TYPE_AI2U,
            )

        service = JotFormAPIService(user=user)
        chat_messages = get_chat_messages(service, agent_id, chat_id, self.logger)

        if chat_messages:
            ChatMessage.objects.bulk_create(chat_messages)
            self.logger.info(
                f"Successfully fetched JotForm agent conversation history, and {len(chat_messages)} messages saved to the database."
            )
        else:
            self.logger.warning("No new messages found in the conversation history.")
