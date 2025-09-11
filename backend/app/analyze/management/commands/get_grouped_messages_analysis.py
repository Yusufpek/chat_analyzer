from analyze.utils.engine_types import EngineType
from analyze.utils.openai_service import OpenAIService
from analyze.utils.replicate_service import ReplicateService
from analyze.utils.claude_service import ClaudeService
from analyze.models.statistics import GroupedMessages
from common.base.base_command import CustomBaseCommand


class Command(CustomBaseCommand):
    command_name = "get_grouped_messages_analysis"
    help = "Get grouped messages analysis for conversations using AI services."

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            "--engine",
            type=str,
            default=EngineType.OPENAI.value,
            help="The AI service engine to test (default: openai).",
        )
        parser.add_argument(
            "--ids",
            nargs="+",
            type=int,
            help="One or more Grouped Message IDs to process.",
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

        grouped_messages = GroupedMessages.objects.all()
        if options.get("ids"):
            grouped_messages = grouped_messages.filter(id__in=options["ids"])
        grouped_messages = grouped_messages.distinct()

        if not grouped_messages.exists():
            self.logger.info("No grouped messages found for analysis.")
            return
        self.logger.info(
            f"Found {grouped_messages.count()} grouped messages for analysis."
        )

        topic_counts = {
            "action": 0,
            "chat": 0,
            "other": 0,
        }

        for grouped_message in grouped_messages:
            self.logger.info(f"Analyzing Grouped Message ID: {grouped_message.id}")
            analyzed_count = 0
            try:
                messages = []
                for group in grouped_message.messages:
                    msg_str = ", ".join(msg for msg in group.get("payloads", []))
                    msg_str = msg_str.strip().rstrip(", ")

                    if not options.get("reanalyze") and group.get("overview"):
                        self.logger.info(
                            f"Grouped Message ID {grouped_message.id} - #{grouped_message.messages.index(group) + 1} already has an overview. Skipping."
                        )
                        messages.append(group)
                        continue

                    overview, type, details = service.get_grouped_messages_analysis(
                        msg_str
                    )
                    if overview and type:
                        self.logger.info(f"Overview: {overview}")
                        self.logger.info(f"Type: {type}")
                        self.logger.info(f"Details: {details}")
                        grouped_message.overview = overview
                        type = type.lower()
                        if type not in ["action", "chat"]:
                            type = "other"
                        group["overview"] = overview
                        group["type"] = type
                        messages.append(group)
                        analyzed_count += 1
                        topic_counts[type] += 1

                        self.logger.info(
                            f"Grouped Message ID {grouped_message.id} - #{grouped_message.messages.index(group) + 1} analyzed successfully."
                        )
                    else:
                        messages.append(group)
                        self.logger.error(
                            f"AI Service return format is wrong: {overview} - {type} - {details}"
                        )
                if analyzed_count == len(grouped_message.messages):
                    grouped_message.is_analyzed = True

                grouped_message.messages = messages
                grouped_message.save()
                self.logger.info(
                    f"Grouped Message ID {grouped_message.id} analyzed successfully."
                )
            except Exception as e:
                self.logger.error(f"An error occurred: {str(e)}")

        self.logger.info(f"Grouped message analysis completed. Counts: {topic_counts}")
