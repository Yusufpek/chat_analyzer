import logging
import os
from datetime import datetime
from django.conf import settings
from django.core.management.base import BaseCommand


class CustomBaseCommand(BaseCommand):
    """
    A custom base command class with logging functionality.
    """

    command_name = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = None
        self.log_file_path = None
        self.now = datetime.now()

    def setup_logger(self, log_file_name=None):
        """
        Sets up the logger for the command with time-based foldering.
        """
        if not log_file_name:
            log_file_name = f"{self.command_name}.log"

        log_dir = os.path.join(
            settings.MEDIA_ROOT,
            "management_logs",
            self.now.strftime("%Y"),
            self.now.strftime("%m"),
            self.now.strftime("%d"),
        )
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        # Define the log file path
        self.log_file_path = os.path.join(log_dir, log_file_name)

        # Set up the logger
        self.logger = logging.getLogger(self.__class__.__name__)
        self.logger.setLevel(logging.DEBUG)

        self.logger.handlers = []

        # File handler
        file_handler = logging.FileHandler(self.log_file_path)
        file_handler.setLevel(logging.DEBUG)

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)

        # Formatter
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)

        # Add handlers to the logger
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)

    def handle(self, *args, **options):
        """
        The main entry point for the command.
        """
        # Set up the logger
        self.setup_logger(
            log_file_name=f"{self.command_name}_{datetime.now().strftime('%H_%M_%S')}.log"
        )

        # Log the start of the command
        self.logger.info(f"Command {self.command_name} started.")

        try:
            # Call the process method (to be implemented in subclasses)
            self.process(*args, **options)
        except Exception as e:
            self.logger.error(f"An error occurred: {e}", exc_info=True)
        finally:
            # Log the end of the command
            self.logger.info("Command finished.")

    def process(self, *args, **options):
        """
        The main logic of the command. Subclasses should override this method.
        """
        raise NotImplementedError("Subclasses must implement the process method.")
