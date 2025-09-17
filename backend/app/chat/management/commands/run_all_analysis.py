from common.base.base_command import CustomBaseCommand
from django.core import management


class Command(CustomBaseCommand):
    help = "Run all analysis tasks"
    command_name = "run_all_analysis"

    def add_arguments(self, parser):
        super().add_arguments(parser)

    def process(self, *args, **options):
        self.logger.info("Running all analysis tasks...")

        self.logger.info("Fetching titles...")
        management.call_command("get_conversation_title")
        self.logger.info("Fetched titles.")

        self.logger.info("Running sentimental analysis...")
        management.call_command("get_sentimental_analysis")
        self.logger.info("Sentimental analysis done.")

        self.logger.info("Conversations to Qdrant...")
        management.call_command("conversations_to_qdrant")
        self.logger.info("Conversations to Qdrant done.")

        self.logger.info("Running group messages task...")
        management.call_command("group_messages")
        self.logger.info("Group messages done.")

        self.logger.info("Running context change analysis task...")
        management.call_command("get_context_change_analysis")
        self.logger.info("Context change analysis done.")
