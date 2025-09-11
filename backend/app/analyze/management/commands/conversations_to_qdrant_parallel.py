from multiprocessing.dummy import Pool
from common.base.base_command import CustomBaseCommand
from analyze.utils.embedding_service import EmbeddingService
from analyze.utils.qdrant_service import QDrantService
from chat.models import ChatMessage

from django.db.models import F

# from multiprocessing import Pool
from datetime import datetime
import traceback


def messages_to_collection(
    agent_id: str,
    qdrant_service: QDrantService,
    embedding_service: EmbeddingService,
    messages: list[dict],
    logger,
):
    if messages is None or len(messages) == 0:
        logger.warning(f"No messages to process for agent_id {agent_id}.")
        return None

    try:
        exists = qdrant_service.check_collection_exists(agent_id, logging=False)
        if not exists:
            response = qdrant_service.create_collection(agent_id, logging=False)
            if not response:
                logger.error(
                    f"Failed to create collection for agent_id {agent_id}: {response}"
                )
                return None

        embedding_response = embedding_service.generate_embedding(
            messages,
            logging=False,
        )
        if embedding_response:
            qdrant_response = qdrant_service.add_messages_to_collection(
                agent_id,
                embedding_response,
                logging=False,
            )
            if qdrant_response:
                ids = [message["embedding_id"] for message in messages]
                logger.info(
                    f"Found to be update {len(ids)} messages as embedded in Qdrant collection {agent_id}."
                )
                return ids
            else:
                logger.error(
                    f"Failed to add messages to Qdrant collection {agent_id}: {qdrant_response}"
                )
        else:
            logger.error(f"Embedding Service returned an error: {embedding_response}")
    except Exception as e:
        logger.error(traceback.format_exc())
        logger.error(
            f"An error occurred while processing agent_id {agent_id}: {str(e)}"
        )
    return None


class Command(CustomBaseCommand):
    help = "Convert conversations to Qdrant DB - Parallel"
    command_name = "conversations_to_qdrant_parallel"

    def add_arguments(self, parser):
        super().add_arguments(parser)

    def process(self, *args, **options):
        now = datetime.now()
        self.logger.info(
            f"Starting conversations to Qdrant process at {now.isoformat()}"
        )
        embedding_service = EmbeddingService()
        qdrant_service = QDrantService()
        messages = (
            ChatMessage.objects.filter(embedded_in_qdrant=False)
            .values(
                "embedding_id",
                "sender_type",
                "content",
                "conversation_id",
                "id",
            )
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
            result_ids = []
            with Pool() as pool:
                result_ids = pool.starmap(
                    messages_to_collection,
                    [
                        (
                            agent_id,
                            qdrant_service,
                            embedding_service,
                            messages,
                            self.logger,
                        )
                        for agent_id, messages in agent_messages.items()
                    ],
                )
            ids = [id for sublist in result_ids for id in sublist if id]
            if ids:
                updated_count = ChatMessage.objects.filter(embedding_id__in=ids).update(
                    embedded_in_qdrant=True
                )
                self.logger.info(
                    f"Updated {updated_count} messages as embedded in Qdrant."
                )
        except Exception as e:
            self.logger.error(f"An error occurred: {str(e)}")
        else:
            self.logger.info("Embedding Service is working correctly.")
        end = datetime.now()
        self.logger.info(
            f"Finished conversations to Qdrant process at {end.isoformat()}, duration: {end - now}"
        )
