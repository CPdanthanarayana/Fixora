from django.db import models
from users.models import User


# Service Category (ex: Plumbing, Cleaning, Electrical, etc.)
class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


# Job (a task posted by a user)
class Job(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name="jobs")
    salary = models.CharField(max_length=100, blank=True, null=True)  
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="jobs")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title
