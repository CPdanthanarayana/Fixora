from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Issue
from .serializers import IssueSerializer

class IssueListCreateView(generics.ListCreateAPIView):
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['title', 'description']

    def get_queryset(self):
        return Issue.objects.all().order_by('-created_at')

class IssueDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.all()
    
    def perform_update(self, serializer):
        # Only allow the owner to update
        if self.get_object().user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only modify your own issues.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow the owner to delete
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own issues.")
        instance.delete()
