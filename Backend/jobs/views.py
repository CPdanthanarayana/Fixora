from .models import ServiceCategory, Job
from .serializers import ServiceCategorySerializer, JobSerializer
from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend


class JobListCreateView(generics.ListCreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status"]                # filter by status
    search_fields = ["title", "description"]     # search by title/description
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]                   # default newest first

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



# Category List + Create
class ServiceCategoryListCreateView(generics.ListCreateAPIView):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# Job Detail (Retrieve, Update, Delete)
class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
