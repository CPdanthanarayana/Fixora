from .models import ServiceCategory, Job
from .serializers import ServiceCategorySerializer, JobSerializer
from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend


from rest_framework.response import Response
from rest_framework import status

class JobListCreateView(generics.ListCreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status"]                # filter by status
    search_fields = ["title", "description"]     # search by title/description
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]                   # default newest first

    def create(self, request, *args, **kwargs):
        try:
            # Get or create the category
            category_name = request.data.get('category')
            if not category_name:
                return Response(
                    {'detail': 'Category is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create the job with the category
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            category, _ = ServiceCategory.objects.get_or_create(name=category_name)
            self.perform_create(serializer, category)

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer, category):
        serializer.save(created_by=self.request.user, category=category)



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
