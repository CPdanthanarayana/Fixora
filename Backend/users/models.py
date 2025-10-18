from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    selected_avatar = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.username
