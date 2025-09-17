from common.base.base_command import CustomBaseCommand
from analyze.utils.embedding_service import EmbeddingService
from analyze.utils.qdrant_service import QDrantService
from chat.models import ChatMessage
from django.db.models import F


class Command(CustomBaseCommand):
    help = "Convert conversations to Qdrant DB"
    command_name = "conversations_to_qdrant"

    def add_arguments(self, parser):
        super().add_arguments(parser)

    def process(self, *args, **options):
        embedding_service = EmbeddingService()
        qdrant_service = QDrantService()
        messages = (
            ChatMessage.objects.filter(embedded_in_qdrant=False)
            .values("embedding_id", "sender_type", "content", "conversation_id", "id")
            .annotate(agent_id=F("conversation__agent_id"))
            .order_by("-created_at")
        )

        agent_messages = {}
        for message in messages:
            agent_messages.setdefault(message["agent_id"], []).append(message)

        if not agent_messages:
            self.logger.warning("No messages found for embedding.")
            return
        try:
            for agent_id, messages in agent_messages.items():
                exists = qdrant_service.check_collection_exists(agent_id)
                if not exists:
                    response = qdrant_service.create_collection(agent_id)
                    if not response:
                        self.logger.error(
                            f"Failed to create collection for agent_id {agent_id}: {response}"
                        )
                        continue

                embedding_response = embedding_service.generate_embedding(messages)
                if embedding_response:
                    qdrant_response = qdrant_service.add_messages_to_collection(
                        agent_id,
                        embedding_response,
                    )
                    if qdrant_response:
                        ids = [message["embedding_id"] for message in messages]
                        updated_count = ChatMessage.objects.filter(
                            embedding_id__in=ids
                        ).update(embedded_in_qdrant=True)
                        self.logger.info(
                            f"Updated {updated_count} messages as embedded in Qdrant collection {agent_id}."
                        )
                    else:
                        self.logger.error(
                            f"Failed to add messages to Qdrant collection {agent_id}: {qdrant_response}"
                        )
                else:
                    self.logger.error(
                        f"Embedding Service returned an error: {embedding_response}"
                    )

        except Exception as e:
            self.logger.error(f"An error occurred: {str(e)}")
        else:
            self.logger.info("Embedding Service is working correctly.")
