from common.base.base_command import CustomBaseCommand
from analyze.utils.embedding_service import EmbeddingService
from chat.models import ChatMessage
from django.db.models import F


class Command(CustomBaseCommand):
    help = "Test Embedding Service"
    command_name = "test_embedding_service"

    def add_arguments(self, parser):
        super().add_arguments(parser)

    def process(self, *args, **options):
        service = EmbeddingService()
        messages = (
            ChatMessage.objects.values(
                "embedding_id", "sender_type", "content", "conversation"
            )
            .annotate(agent_id=F("conversation__agent_id"))
            .order_by("-created_at")
        )
        agent_messages = {}
        for message in messages:
            agent_messages.setdefault(message["agent_id"], []).append(message)
        try:
            for agent_id, messages in agent_messages.items():
                response = service.generate_embedding(messages)
                if response:
                    self.logger.info(
                        "Embedding Service is reachable and working correctly."
                    )
                else:
                    self.logger.error(
                        f"Embedding Service returned an error: {response}"
                    )

        except Exception as e:
            self.logger.error(f"An error occurred: {str(e)}")
        else:
            self.logger.info("Embedding Service is working correctly.")
