from rest_framework import serializers
from .models import ServiceCategory, Job


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "description"]


class JobSerializer(serializers.ModelSerializer):
    category = serializers.CharField(write_only=True)  # Accept string input
    category_name = serializers.CharField(source='category.name', read_only=True)  # Return category name

    class Meta:
        model = Job
        fields = ["id", "title", "description", "category", "category_name", "salary", "created_by", "created_at", "updated_at", "is_active"]
        read_only_fields = ["created_by", "created_at", "updated_at"]
