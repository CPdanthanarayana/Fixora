# notifications/models.py
from django.db import models
from django.conf import settings
from jobs.models import Job
from issues.models import Issue

User = settings.AUTH_USER_MODEL

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('job_message', 'New Job Message'),
        ('issue_message', 'New Issue Message'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    
    # Reference to the job or issue
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, null=True, blank=True)
    
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.message[:50]}"