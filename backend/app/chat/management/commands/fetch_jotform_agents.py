from common.base.base_command import CustomBaseCommand
from common.utils.jotform_api import JotFormAPIService
from common.models.connection import Connection, Agent
from common.constants.sources import SOURCE_JOTFORM
from chat.utils.jotform_conversation import get_agents


class Command(CustomBaseCommand):
    help = "Fetch JotForm agent conversation history"
    command_name = "fetch_jotform_agents"

    def add_arguments(self, parser):
        parser.add_argument(
            "--connection_id",
            type=str,
            required=True,
            help="The ID of the JotForm agent to fetch conversations for.",
        )

    def process(self, *args, **options):
        connection_id = options["connection_id"]
        connection = Connection.objects.filter(
            connection_type=SOURCE_JOTFORM, id=connection_id
        ).first()
        if not connection:
            self.logger.error("No JotForm connection found for user.")
            return

        user = connection.user
        agent_ids = Agent.objects.filter(
            connection=connection,
        ).values_list("id", flat=True)

        self.logger.info(f"Found {len(agent_ids)} agents in JotForm connection.")

        service = JotFormAPIService(user=user)
        agents = get_agents(service, agent_ids=agent_ids)

        if agents:
            Agent.objects.bulk_create(agents)
            self.logger.info(
                f"Successfully fetched JotForm agents, and {len(agents)} agents saved to the database."
            )
        else:
            self.logger.warning("No new agents found.")
