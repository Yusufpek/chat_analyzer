from analyze.utils.engine_types import EngineType
from analyze.utils.openai_service import OpenAIService
from analyze.utils.replicate_service import ReplicateService
from analyze.utils.claude_service import ClaudeService
from chat.models.conversation import Conversation, ChatMessage
from chat.serializers.conversation import ChatMessageSerializer
from common.base.base_command import CustomBaseCommand


class Command(CustomBaseCommand):
    command_name = "get_conversation_title"
    help = "Get title for conversations using AI services."

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            "--engine",
            type=str,
            default=EngineType.ANTHROPIC_CLAUDE.value,
            help="The AI service engine to test (default: claude).",
        )

    def process(self, *args, **options):
        engine = options["engine"].lower()
        if engine == EngineType.OPENAI.value:
            service = OpenAIService()
            self.logger.info("Using OpenAI Service...")
        elif engine == EngineType.REPLICATE.value:
            service = ReplicateService()
            self.logger.info("Using Replicate Service...")
        elif engine == EngineType.ANTHROPIC_CLAUDE.value:
            service = ClaudeService()
            self.logger.info("Using Claude Service...")
        else:
            self.logger.error(
                f"Unsupported engine: {engine}. Supported engines are: openai, replicate, claude."
            )
            return

        conversations = Conversation.objects.filter(
            title__isnull=True,
            messages__isnull=False,
        ).distinct()
        if not conversations.exists():
            self.logger.info("No conversations found for analysis.")
            return
        self.logger.info(f"Found {conversations.count()} conversations for analysis.")

        for conversation in conversations:
            self.logger.info(f"Analyzing conversation ID: {conversation.id}")
            try:
                messages = ChatMessage.objects.filter(
                    conversation_id=conversation.id,
                ).order_by("created_at")
                if not messages:
                    self.logger.error(
                        f"No messages found for conversation ID: {conversation.id}"
                    )
                    continue
                text = "\n".join(
                    [
                        f"{ChatMessageSerializer(message).data['sender_type']}: {ChatMessageSerializer(message).data['content']}"
                        for message in messages
                    ]
                )
                title, details = service.get_conversation_title(text)
                if title and details:
                    self.logger.info(f"Title: {title}")
                    self.logger.info(f"Details: {details}")
                    conversation.title = title
                    conversation.save()
                    self.logger.info(
                        f"Conversation ID {conversation.id} analyzed successfully."
                    )
                else:
                    self.logger.error(
                        f"AI Service return format is wrong: {title} - {details}"
                    )
            except Exception as e:
                self.logger.error(f"An error occurred: {str(e)}")

        self.logger.info("Title extraction completed.")
