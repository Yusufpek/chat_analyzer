from django.contrib.auth.models import AbstractUser

from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    profile_image = models.FileField(
        _("Profile Image"),
        upload_to="profile_images/",
        max_length=100,
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.username
