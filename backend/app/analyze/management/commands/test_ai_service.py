from common.base.base_command import CustomBaseCommand
from analyze.utils.openai_service import OpenAIService
from analyze.utils.replicate_service import ReplicateService


class Command(CustomBaseCommand):
    help = "Test AI Service"
    command_name = "test_ai_service"

    def add_arguments(self, parser):
        parser.add_argument(
            "--engine",
            type=str,
            default="openai",
            help="The AI service engine to test (default: openai).",
        )

    def process(self, *args, **options):
        engine = options["engine"].lower()
        if engine == "openai":
            service = OpenAIService()
            content = "Hello, how are you?"
            self.logger.info("Testing OpenAI Service...")
        elif engine == "replicate":
            service = ReplicateService()
            content = {
                "text": "Hello, how are you?",
            }
            self.logger.info("Testing Replicate Service...")
        else:
            self.logger.error(
                f"Unsupported engine: {engine}. Supported engines are: openai, replicate."
            )
            return
        try:
            response = service.send_request(content)
            if response:
                self.logger.info("AI Service is reachable and working correctly.")

                self.logger.info(f"Response: {response}")
            else:
                self.logger.error(f"AI Service returned an error: {response}")

        except Exception as e:
            self.logger.error(f"An error occurred: {str(e)}")
        else:
            self.logger.error("AI Service is working correctly.")
