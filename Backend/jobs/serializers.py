from rest_framework import serializers
from .models import ServiceCategory, Job


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "description"]


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ["id", "title", "description", "category", "created_by", "created_at", "updated_at", "is_active"]
        read_only_fields = ["created_by", "created_at", "updated_at"]
