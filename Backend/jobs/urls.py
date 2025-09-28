from django.urls import path
from .views import ServiceCategoryListCreateView, JobListCreateView, JobDetailView

urlpatterns = [
    path("jobs/categories/", ServiceCategoryListCreateView.as_view(), name="category_list_create"),
    path("jobs/", JobListCreateView.as_view(), name="job_list_create"),
    path("jobs/<int:pk>/", JobDetailView.as_view(), name="job_detail"),
]
