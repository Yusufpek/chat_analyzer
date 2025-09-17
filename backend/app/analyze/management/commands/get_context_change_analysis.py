from analyze.utils.engine_types import EngineType
from analyze.utils.openai_service import OpenAIService
from analyze.utils.replicate_service import ReplicateService
from analyze.utils.claude_service import ClaudeService
from chat.models.conversation import Conversation, ChatMessage
from chat.serializers.conversation import ChatMessageSerializer
from common.base.base_command import CustomBaseCommand
from analyze.models.statistics import ContextChange
import traceback


class Command(CustomBaseCommand):
    command_name = "get_context_change_analysis"
    help = "Get context change analysis for conversations using AI services."

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            "--engine",
            type=str,
            default=EngineType.OPENAI.value,
            help="The AI service engine to test (default: openai).",
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
            context_analysis_done=False,
            messages__isnull=False,
        ).distinct()

        if not conversations.exists():
            self.logger.info("No conversations found for analysis.")
            return
        self.logger.info(f"Found {conversations.count()} conversations for analysis.")

        context_change_analyses = []
        context_analyzed_conversation_ids = set()
        for conversation in conversations:
            if ContextChange.objects.filter(conversation_id=conversation.id).exists():
                self.logger.info(
                    f"Context change analysis already exists for conversation ID: {conversation.id}, skipping."
                )
                continue

            self.logger.info(f"Analyzing conversation ID: {conversation.id}")

            messages = ChatMessage.objects.filter(
                conversation_id=conversation.id,
            ).order_by("created_at")

            if not messages:
                self.logger.info(
                    f"No messages found for conversation ID: {conversation.id}. Skipping."
                )
                continue

            text = "\n".join(
                [
                    f"{ChatMessageSerializer(message).data['sender_type']}: {ChatMessageSerializer(message).data['content']}"
                    for message in messages
                ]
            )

            try:
                results = service.context_change_analysis(text)
                overall_context, topics, context_changes = results

                if overall_context or topics:
                    context_analyzed_conversation_ids.add(conversation.id)

                if context_changes:
                    self.logger.info(f"Overall Context: {overall_context}")
                    self.logger.info(f"Topics: {topics}")
                    self.logger.info(f"Context Changes: {context_changes}")
                    context_change_analyses.append(
                        ContextChange(
                            conversation_id=conversation.id,
                            overall_context=overall_context,
                            topics=topics,
                            context_changes=context_changes,
                        )
                    )
                    self.logger.info(
                        f"Conversation ID {conversation.id} analyzed successfully."
                    )
                else:
                    self.logger.info(
                        f"No context changes found for conversation ID: {conversation.id}."
                    )

            except Exception as e:
                traceback.print_exc()
                self.logger.error(f"An error occurred: {str(e)}")

        if context_change_analyses:
            ContextChange.objects.bulk_create(context_change_analyses)
            self.logger.info(
                f"Saved {len(context_change_analyses)} context change analyses."
            )
        if context_analyzed_conversation_ids:
            Conversation.objects.filter(
                id__in=context_analyzed_conversation_ids
            ).update(context_analysis_done=True)
            self.logger.info(
                f"Updated {len(context_analyzed_conversation_ids)} conversations as context analyzed."
            )

        self.logger.info("Context change analysis completed.")
