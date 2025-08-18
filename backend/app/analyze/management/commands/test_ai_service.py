from django.core.management.base import BaseCommand
from analyze.utils.openai_service import OpenAIService
from analyze.utils.replicate_service import ReplicateService


class Command(BaseCommand):
    help = "Test AI Service"

    def add_arguments(self, parser):
        parser.add_argument(
            "--engine",
            type=str,
            default="openai",
            help="The AI service engine to test (default: openai).",
        )

    def handle(self, *args, **options):
        engine = options["engine"].lower()
        if engine == "openai":
            service = OpenAIService()
            content = "Hello, how are you?"
            self.stdout.write(self.style.SUCCESS("Testing OpenAI Service..."))
        elif engine == "replicate":
            service = ReplicateService()
            content = {
                "text": "Hello, how are you?",
            }
            self.stdout.write(self.style.SUCCESS("Testing Replicate Service..."))
        else:
            self.stdout.write(
                self.style.ERROR(
                    f"Unsupported engine: {engine}. Supported engines are: openai, replicate."
                )
            )
            return
        try:
            response = service.send_request(content)
            if response:
                self.stdout.write(
                    self.style.SUCCESS("AI Service is reachable and working correctly.")
                )
                self.stdout.write(f"Response: {response}")
            else:
                self.stdout.write(
                    self.style.ERROR(f"AI Service returned an error: {response}")
                )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {str(e)}"))
        else:
            self.stdout.write(self.style.SUCCESS("AI Service is working correctly."))
