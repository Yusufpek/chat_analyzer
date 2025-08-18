from django.core.management.base import BaseCommand

from common.utils.jotform_api import JotFormAPIService
from common.models.connection import Connection
from common.constants.sources import SOURCE_JOTFORM
from chat.models.conversation import Conversation
from chat.utils.jotform_conversation import get_conversations


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
        connection_id = options["connection_id"]
        connection = Connection.objects.filter(
            connection_type=SOURCE_JOTFORM, id=connection_id
        ).first()
        if not connection:
            self.stdout.write(self.style.ERROR("No JotForm connection found for user."))
            return

        user = connection.user
        config = connection.config
        agent_ids = [agent.get("agent_id") for agent in config.get("agents", [])]

        if not agent_ids:
            self.stdout.write(
                self.style.ERROR("No agents found in JotForm connection configuration.")
            )
            return

        service = JotFormAPIService(user=user)
        conversation_ids = Conversation.objects.values_list("id", flat=True)

        conversations = []
        for agent_id in agent_ids:
            # request
            convs = get_conversations(service, agent_id, user.id, conversation_ids)
            if convs:
                conversations.extend(convs)

        if conversations:
            Conversation.objects.bulk_create(conversations)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully fetched JotForm agent conversations, and {len(conversations)} conversations saved to the database."
                )
            )
        else:
            self.stdout.write(self.style.WARNING("No new conversations found to save."))
