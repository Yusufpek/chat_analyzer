import logging
import os
import traceback
import uuid

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone


class BackgroundProcess(BaseCommand):
    _log_model = None
    command_name = None
    log_file_name = None
    success_return = True, "Everything is OK"

    def __init__(self, *args, **kwargs):
        super(BackgroundProcess, self).__init__(*args, **kwargs)
        self.logger = logging.getLogger(str(uuid.uuid4()))
        self.start_time = None
        self.end_time = None
        self.current_time = timezone.now()
        self.current_time_str = str(self.current_time).replace(":", "_")
        self.log_instance = None
        self.log_file_path = ""
        self.now = timezone.now()
        self.log_file_name = (
            self.log_file_name
            if self.log_file_name
            else self.command_name
            if self.command_name
            else "default"
        )

    def add_arguments(self, command):
        command.add_argument("--log_level", type=str, default="WARNING")
        command.add_argument("--verbose", const="DEBUG", action="store_const")
        command.add_argument(
            "--log_dir",
            nargs="?",
            type=str,
            default=os.path.join("logs", self.now.astimezone().strftime("%Y/%m/%d")),
            help="Logs will be printed to this directory. Non-absolute paths will automatically go under MEDIA_ROOT directory.",
        )

    def _pre_logging(self, **options):
        self.logger.debug("Arguments are given in command line without an error.")

        log_level = options["log_level"]

        self.logger.setLevel(logging.DEBUG)

        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
        console_handler = logging.StreamHandler()
        console_handler.setLevel(getattr(logging, log_level))
        console_handler.setFormatter(formatter)

        if options["verbose"]:
            console_handler.setLevel(logging.DEBUG)

        self.logger.addHandler(console_handler)

        log_file_path = os.path.join(settings.MEDIA_ROOT, options["log_dir"])
        # If log directory does not exist, make it
        if not os.path.exists(log_file_path):
            os.makedirs(log_file_path, exist_ok=True)

        file_name = f"{self.log_file_name}_{self.now.astimezone().strftime('%H-%M-%S-%f')}.log".replace(
            " ", "_"
        )
        self.log_file_media_path = os.path.join(options["log_dir"], file_name)

        # Create unique file name with absolute path
        self.log_file_absolute_path = os.path.join(
            settings.MEDIA_ROOT, self.log_file_media_path
        )

        try:
            file_handler = logging.FileHandler(self.log_file_absolute_path)
            file_handler.setLevel(logging.DEBUG)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
        except Exception:
            pass

        if self._log_model is not None:
            log = dict()
            log["start_time"] = self.start_time
            log["status"] = "In Progress"
            self.log_instance = self._log_model.objects.create(**log)

        return True, "Command has successfully created loggers"

    def process(self, **options):
        return self.success_return

    def remove_log_handlers(self):
        handlers = self.logger.handlers[:]
        for handler in handlers:
            self.logger.removeHandler(handler)
            handler.close()
        try:
            del logging.Logger.manager.loggerDict[self.logger.name]
        except Exception:
            pass

        try:
            del self.logger  # this was added to try and force a clean up of
        except Exception:
            pass

    def _post_logging(self, **options):
        log = {
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration": int((self.end_time - self.start_time).total_seconds()),
            "is_successful": options["is_successful"],
            "detail_message": options["detail_message"],
            "status": "Completed",
            "triggered_by": options["initiator"],
        }

        if not self.log_instance and self._log_model:
            self.log_instance = self._log_model.objects.create(**log)

        # Create log instance for healthcheck
        log.update(**self.log_extra_fields)
        if self.log_instance:
            for k, v in log.items():
                setattr(self.log_instance, k, v)

            self.log_instance.log_file.name = self.log_file_media_path
            self.log_instance.save()
            self.logger.info("Healthcheck log instance created.")

        log_details = list()
        log_details.append("Started at: " + str(log["start_time"]))
        log_details.append("Ended at: " + str(log["end_time"]))
        log_details.append(
            "Command is completed in {0} seconds.".format(log["duration"])
        )
        return log, log_details

    def handle(self, *arg, **options):
        self.start_time = timezone.now()

        self._pre_logging(**options)

        # Log and Record start time
        command_name = getattr(self, "command_name", "")
        self.logger.info("%s Command is Starting" % command_name)

        # If an exception occurs in the process section, report the command as unsuccessful
        try:
            is_successful, detail_message = self.process(**options)
            options["is_successful"] = is_successful
            options["detail_message"] = detail_message
        except Exception:
            self.logger.error(traceback.format_exc())
            options["error_traceback"] = traceback.format_exc()

        # post-process
        self.end_time = timezone.now()

        # post-log
        log_message = self._post_logging(**options)

        # post-check
        self.post_check(log_message)

        self.logger.info("%s Finished" % command_name)

        self.remove_log_handlers()

        return
