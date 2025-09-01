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
            ChatMessage.objects.values("id", "sender_type", "content", "conversation")
            .annotate(agent_id=F("conversation__agent_id"))
            .order_by("-created_at")
        )
        agent_messages = {}
        for message in messages:
            agent_messages.setdefault(
                message["agent_id"], {"assistant": [], "user": []}
            )[message["sender_type"]].append(message)
        try:
            for agent_id, messages in agent_messages.items():
                embed_messages = messages["user"]
                break

            response = service.generate_embedding(embed_messages)
            if response:
                self.logger.info(
                    "Embedding Service is reachable and working correctly."
                )

                self.logger.info(f"Response: {response}")
            else:
                self.logger.error(f"Embedding Service returned an error: {response}")

        except Exception as e:
            self.logger.error(f"An error occurred: {str(e)}")
        else:
            self.logger.info("Embedding Service is working correctly.")
