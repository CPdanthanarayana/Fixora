from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    issue_title = serializers.CharField(source='issue.title', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'message', 'is_read', 
            'created_at', 'sender_username', 'job_title', 'issue_title',
            'job', 'issue'
        ]
        read_only_fields = ['sender', 'created_at']