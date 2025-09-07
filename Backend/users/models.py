from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Extra fields (optional now, but good for future extension)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.username
