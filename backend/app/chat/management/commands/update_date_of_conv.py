from common.base.base_command import CustomBaseCommand
from chat.models.conversation import Conversation, ChatMessage
from datetime import timedelta, datetime


class Command(CustomBaseCommand):
    help = "Run all analysis tasks"
    command_name = "run_all_analysis"

    def add_arguments(self, parser):
        super().add_arguments(parser)

    def process(self, *args, **options):
        now = datetime.now()
        conversations = Conversation.objects.order_by("-created_at").filter(
            created_at__gte=(now - timedelta(days=1) - timedelta(hours=7))
        )
        self.logger.info(f"Found {conversations.count()} conversations to update.")

        if conversations.count() > 10:
            conversations = conversations[10:]
            self.logger.info(f"Limiting to {conversations.count()} conversations.")
        else:
            self.logger.info("No conversations to update.")
            return

        if conversations.count() > 1:
            for conversation in conversations[: conversations.count() - 1]:
                conversation.created_at = conversation.created_at - timedelta(days=1)
                conversation.save()
                for msg in ChatMessage.objects.filter(
                    conversation_id=conversation.id,
                ):
                    msg.created_at = msg.created_at - timedelta(days=1)
                    msg.save()
        last = conversations[conversations.count() - 1]
        last.created_at = last.created_at - timedelta(days=17)
        for msg in ChatMessage.objects.filter(
            conversation_id=last.id,
        ):
            msg.created_at = msg.created_at - timedelta(days=17)
            msg.save()
        last.save()
