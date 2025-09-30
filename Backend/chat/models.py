# chat/models.py
from django.db import models
from django.conf import settings
from jobs.models import Job
from issues.models import Issue

User = settings.AUTH_USER_MODEL

# Private Chat Models
class JobPrivateChat(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="private_chats")
    participant1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="job_private_chats_as_p1")
    participant2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="job_private_chats_as_p2")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['job', 'participant1', 'participant2']

    def __str__(self):
        return f"Private Job Chat: {self.job.title} ({self.participant1} ↔ {self.participant2})"

    def get_other_participant(self, user):
        """Get the other participant in this chat"""
        return self.participant2 if self.participant1 == user else self.participant1


class IssuePrivateChat(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="private_chats")
    participant1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="issue_private_chats_as_p1")
    participant2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="issue_private_chats_as_p2")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['issue', 'participant1', 'participant2']

    def __str__(self):
        return f"Private Issue Chat: {self.issue.title} ({self.participant1} ↔ {self.participant2})"

    def get_other_participant(self, user):
        """Get the other participant in this chat"""
        return self.participant2 if self.participant1 == user else self.participant1


class JobPrivateMessage(models.Model):
    chat = models.ForeignKey(JobPrivateChat, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender} → {self.text[:20]}"


class IssuePrivateMessage(models.Model):
    chat = models.ForeignKey(IssuePrivateChat, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender} → {self.text[:20]}"


