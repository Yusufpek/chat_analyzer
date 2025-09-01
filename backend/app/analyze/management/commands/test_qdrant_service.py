from common.base.base_command import CustomBaseCommand
from analyze.utils.qdrant_service import QDrantService


class Command(CustomBaseCommand):
    help = "Test Q Service"
    command_name = "test_qdrant_service"

    def add_arguments(self, parser):
        super().add_arguments(parser)

    def process(self, *args, **options):
        service = QDrantService()
        try:
            response = service.get_collections()
            if response:
                self.logger.info("QDrant Service is reachable and working correctly.")

                self.logger.info(f"Response: {response}")
            else:
                self.logger.error(f"QDrant Service returned an error: {response}")
        except Exception as e:
            self.logger.error(f"An error occurred: {str(e)}")
        else:
            self.logger.info("QDrant Service is working correctly.")
