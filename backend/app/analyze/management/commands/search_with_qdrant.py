from common.base.base_command import CustomBaseCommand
from analyze.utils.search_helper import search_agent_with_qdrant


class Command(CustomBaseCommand):
    help = "Search with QDrant"
    command_name = "search_with_qdrant"

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            "--agent_id",
            type=str,
            help="The ID of the agent to filter messages by.",
            default="0198994961cd76d0b85cd90122f97215bd53",
        )
        parser.add_argument(
            "--query",
            type=str,
            help="The query to filter messages by.",
            default="form filling",
        )

    def process(self, *args, **options):
        agent_id = options.get("agent_id")
        query = options.get("query")

        try:
            status, data = search_agent_with_qdrant(agent_id, query)
            if status:
                self.logger.info(
                    "QDrant Query Service is reachable and working correctly."
                )
                self.logger.info(f"Response: {data}")
            else:
                self.logger.error(f"QDrant Query Service returned an error: {data}")
        except Exception as e:
            self.logger.error(f"An error occurred: {str(e)}")
        else:
            self.logger.info("QDrant Query Service is working correctly.")
