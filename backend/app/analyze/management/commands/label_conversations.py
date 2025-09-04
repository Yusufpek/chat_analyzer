from venv import logger
from analyze.utils.engine_types import EngineType
from analyze.utils.openai_service import OpenAIService
from analyze.utils.replicate_service import ReplicateService
from analyze.utils.claude_service import ClaudeService
from chat.models.conversation import Conversation, ChatMessage
from chat.serializers.conversation import ChatMessageSerializer
from common.models.connection import Agent
from common.base.base_command import CustomBaseCommand


class Command(CustomBaseCommand):
    command_name = "label_conversations"
    help = "Label conversations using AI services."

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            "--engine",
            type=str,
            default=EngineType.OPENAI.value,
            help="The AI service engine to test (default: openai).",
        )

        parser.add_argument(
            "--all",
            action="store_true",
            default=False,
            help="Whether to label all conversations (default: False).",
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

        agents = Agent.objects.filter(label_choices__isnull=False).distinct()
        print(agents)
        if not agents:
            self.logger.error("No agents found with label choices.")
            return

        results = {}
        for agent in agents:
            self.logger.info(f"Found agent with ID: {agent.id}")

            conversations = Conversation.objects.filter(
                agent_id=agent.id,
                messages__isnull=False,
            )

            if not options["all"]:
                conversations = conversations.filter(label__isnull=True)

            conversations = conversations.distinct()

            if not conversations.exists():
                self.logger.info("No conversations found for analysis.")
                continue

            self.logger.info(
                f"Found {conversations.count()} conversations for analysis."
            )

            label_counts = {label.lower(): 0 for label in agent.label_choices}

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
                    labels = "/".join(agent.label_choices)
                    self.logger.info(f"Labels: {labels}")
                    labels_str = f"<{labels}>"
                    label, details = service.label_analysis(text, labels_str)
                    if label and details:
                        self.logger.info(
                            "AI Service is reachable and working correctly."
                        )
                        self.logger.info(f"Label: {label}")
                        self.logger.info(f"Details: {details}")
                        conversation.label = label.upper()
                        # conversation.label_details = f"{engine}: {details}"
                        conversation.save()
                        self.logger.info(
                            f"Conversation ID {conversation.id} analyzed successfully."
                        )
                        label_counts[label.lower()] += 1
                    else:
                        self.logger.error(
                            f"AI Service return format is wrong: {label} - {details}"
                        )
                except Exception as e:
                    self.logger.error(f"An error occurred: {str(e)}")

            self.logger.info(f"Label analysis completed. Counts: {label_counts}")
            results[agent.id] = label_counts

        self.logger.info(f"All agents processed. Results: {results}")
