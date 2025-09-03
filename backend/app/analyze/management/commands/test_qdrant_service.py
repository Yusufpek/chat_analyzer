from common.base.base_command import CustomBaseCommand
from analyze.utils.qdrant_service import QDrantService
from chat.models.conversation import ChatMessage


class Command(CustomBaseCommand):
    help = "Test Q Service"
    command_name = "test_qdrant_service"

    def add_arguments(self, parser):
        super().add_arguments(parser)

    def process(self, *args, **options):
        service = QDrantService()
        try:
            # Get Message
            message = service.get_message(
                "0198994961cd76d0b85cd90122f97215bd53",
                "9e41ea60-35fb-47bb-9e13-2ea4debeabf1",
            )
            if message:
                if "vector" in message:
                    message["vector"] = message["vector"][:3]
                self.logger.info(f"Message: {message}")
                self.logger.info("Get message successful")
            else:
                self.logger.error("Get message failed")

            # Get Messages in collection
            response = service.get_messages("0198994961cd76d0b85cd90122f97215bd53")
            if response:
                for r in response:
                    r["vector"] = r["vector"][:3]

                self.logger.info(f"Response: {response}")
                self.logger.info("Get messages successful")
            else:
                self.logger.error("Get messages failed")

            # Get Grouped Messages
            messages = ChatMessage.objects.filter(
                conversation__agent_id="0198994961cd76d0b85cd90122f97215bd53",
            )
            embed_id_to_messages = {msg.embedding_id: msg for msg in messages}

            message_ids = messages.values_list("embedding_id", flat=True)
            response = service.get_grouped_messages(
                "0198994961cd76d0b85cd90122f97215bd53",
                message_ids,
                ChatMessage.SENDER_TYPE_USER,
            )
            for group in response:
                group["payloads"] = [
                    embed_id_to_messages[m_id].content
                    for m_id in group["ids"]
                    if m_id in embed_id_to_messages
                ]
                group["ids"] = [
                    embed_id_to_messages[m_id].id
                    for m_id in group["ids"]
                    if m_id in embed_id_to_messages
                ]

            if response:
                self.logger.info(f"Response: {response}")
                self.logger.info("Get grouped messages successful")
        except Exception as e:
            self.logger.error(f"An error occurred: {str(e)}")
        else:
            self.logger.info("QDrant Service is working correctly.")
