# chat/models.py
from django.db import models
from django.conf import settings
from jobs.models import Job
from issues.models import Issue

User = settings.AUTH_USER_MODEL

class ChatRoom(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="chat_rooms")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="chat_rooms")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("issue", "job")  # one room per issue-job pair

    def __str__(self):
        return f"Chat: Issue {self.issue.id} ↔ Job {self.job.id}"


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} → {self.text[:20]}"
