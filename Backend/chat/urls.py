from django.urls import path
from .views import JobChatMessagesView, IssueChatMessagesView, JobConversationsView, IssueConversationsView

urlpatterns = [
    path("job/<int:job_id>/messages/", JobChatMessagesView.as_view(), name="job-chat-messages"),
    path("issue/<int:issue_id>/messages/", IssueChatMessagesView.as_view(), name="issue-chat-messages"),
    path("job/<int:job_id>/conversations/", JobConversationsView.as_view(), name="job-conversations"),
    path("issue/<int:issue_id>/conversations/", IssueConversationsView.as_view(), name="issue-conversations"),
]
