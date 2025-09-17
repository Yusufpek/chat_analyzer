from common.base.base_command import CustomBaseCommand
from analyze.utils.search_helper import get_grouped_messages
from analyze.models.statistics import GroupedMessages
from common.models.connection import Agent
from chat.models.conversation import ChatMessage
import traceback


class Command(CustomBaseCommand):
    help = "Group messages with QDrant"
    command_name = "group_messages"

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            "--agent_ids",
            nargs="+",
            type=str,
            help="One or more agent IDs to filter messages by.",
            default=[],
        )
        parser.add_argument(
            "--sender_type",
            type=str,
            help="The sender type to filter messages by.",
            default="user",
        )

    def process(self, *args, **options):
        agent_ids = options.get("agent_ids")
        sender_type = options.get("sender_type")

        if not agent_ids:
            agent_ids = Agent.objects.values_list("id", flat=True)

        if not agent_ids:
            self.logger.info("No agents found. Exiting.")
            return

        # grouped_messages = []
        for agent_id in agent_ids:
            try:
                grouped = GroupedMessages.objects.filter(agent_id=agent_id).first()
                if (
                    grouped
                    and not ChatMessage.objects.filter(
                        conversation__agent_id=agent_id,
                        sender_type=sender_type,
                        saved_at__gte=grouped.created_at,
                    ).exists()
                ):
                    self.logger.info(
                        f"Agent: {agent_id} - No new messages found. Skipping."
                    )
                    continue

                status, data = get_grouped_messages(agent_id, sender_type=sender_type)
                if status:
                    self.logger.info(f"Agent: {agent_id} - Data: {data}")
                    # delete old grouped messages
                    if grouped:
                        grouped.delete()

                    # create new grouped messages
                    GroupedMessages.objects.create(
                        agent_id=agent_id,
                        messages=data,
                    )
                    self.logger.info(
                        f"Agent: {agent_id} - Grouped messages created successfully."
                    )

                    # grouped_messages.append(
                    #     GroupedMessages(
                    #         agent_id=agent_id,
                    #         messages=data,
                    #     )
                    # )
                else:
                    self.logger.error(
                        f"QDrant Query Service returned an error: {data} - agent: {agent_id}"
                    )
            except Exception as e:
                traceback.print_exc()
                self.logger.error(f"An error occurred: {str(e)} - agent: {agent_id}")

        # if grouped_messages:
        #     GroupedMessages.objects.bulk_create(grouped_messages)
        #     self.logger.info(f"Created {len(grouped_messages)} grouped messages.")
        self.logger.info("Command finished.")
