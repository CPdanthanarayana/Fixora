from rest_framework import serializers
from .models import JobPrivateMessage, IssuePrivateMessage


class JobPrivateMessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = JobPrivateMessage
        fields = ["id", "chat", "sender", "text", "created_at"]


class IssuePrivateMessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = IssuePrivateMessage
        fields = ["id", "chat", "sender", "text", "created_at"]
