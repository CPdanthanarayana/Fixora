from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from jobs.models import Job

User = get_user_model()
from issues.models import Issue
from .models import JobPrivateChat, JobPrivateMessage, IssuePrivateChat, IssuePrivateMessage
from notifications.models import Notification


class JobChatMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id):
        """Get messages for a private job chat between current user and another user"""
        job = get_object_or_404(Job, id=job_id)
        current_user = request.user
        job_creator = job.created_by
        
        # Get the other user ID from query parameters (for creators to specify who to chat with)
        other_user_id = request.GET.get('user_id')
        
        if other_user_id:
            # Creator wants to chat with a specific user
            try:
                
                other_user = User.objects.get(id=other_user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Don't allow user to chat with themselves
            if current_user == other_user:
                return Response({'error': 'Cannot chat with yourself'}, status=status.HTTP_400_BAD_REQUEST)
                
            participant1 = current_user if current_user.id < other_user.id else other_user
            participant2 = other_user if current_user.id < other_user.id else current_user
        else:
            # Non-creator wants to chat with job creator (default behavior)
            if current_user == job_creator:
                # Creator trying to access chat without specifying user - return empty
                return Response([])
                
            participant1 = current_user if current_user.id < job_creator.id else job_creator
            participant2 = job_creator if current_user.id < job_creator.id else current_user
        
        private_chat, created = JobPrivateChat.objects.get_or_create(
            job=job,
            participant1=participant1,
            participant2=participant2,
            defaults={
                'job': job,
                'participant1': participant1,
                'participant2': participant2
            }
        )
        
        messages = JobPrivateMessage.objects.filter(chat=private_chat).order_by('created_at')
        
        # Format messages for frontend
        message_data = []
        for msg in messages:
            message_data.append({
                'id': msg.id,
                'text': msg.text,
                'sender': msg.sender.username,
                'is_sender': msg.sender == request.user,
                'created_at': msg.created_at.isoformat(),
            })
        
        return Response(message_data)

    def post(self, request, job_id):
        """Send a message to private job chat"""
        job = get_object_or_404(Job, id=job_id)
        current_user = request.user
        job_creator = job.created_by
        
        # Get the other user ID from request data (for creators to specify who to message)
        other_user_id = request.data.get('user_id')
        
        if other_user_id:
            # Creator wants to message a specific user
            try:
                
                other_user = User.objects.get(id=other_user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Don't allow user to message themselves
            if current_user == other_user:
                return Response({'error': 'Cannot message yourself'}, status=status.HTTP_400_BAD_REQUEST)
                
            participant1 = current_user if current_user.id < other_user.id else other_user
            participant2 = other_user if current_user.id < other_user.id else current_user
        else:
            # Default behavior: chat with job creator
            if current_user == job_creator:
                return Response({'error': 'Creator must specify user_id to message someone'}, status=status.HTTP_400_BAD_REQUEST)
                
            participant1 = current_user if current_user.id < job_creator.id else job_creator
            participant2 = job_creator if current_user.id < job_creator.id else current_user
        
        private_chat, created = JobPrivateChat.objects.get_or_create(
            job=job,
            participant1=participant1,
            participant2=participant2,
            defaults={
                'job': job,
                'participant1': participant1,
                'participant2': participant2
            }
        )
        
        # Create message
        message = JobPrivateMessage.objects.create(
            chat=private_chat,
            sender=request.user,
            text=request.data.get('text', '')
        )
        
        # Create notification for the other participant only
        other_participant = private_chat.get_other_participant(current_user)
        Notification.objects.create(
            recipient=other_participant,
            sender=current_user,
            notification_type='job_message',
            job=job,
            message=f"New private message from {current_user.username} on job '{job.title}': {message.text[:50]}..."
        )
        
        # Return formatted message
        return Response({
            'id': message.id,
            'text': message.text,
            'sender': message.sender.username,
            'is_sender': True,
            'created_at': message.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


class IssueChatMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, issue_id):
        """Get messages for a private issue chat between current user and another user"""
        issue = get_object_or_404(Issue, id=issue_id)
        current_user = request.user
        issue_creator = issue.user
        
        # Get the other user ID from query parameters (for creators to specify who to chat with)
        other_user_id = request.GET.get('user_id')
        
        if other_user_id:
            # Creator wants to chat with a specific user
            try:
                
                other_user = User.objects.get(id=other_user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Don't allow user to chat with themselves
            if current_user == other_user:
                return Response({'error': 'Cannot chat with yourself'}, status=status.HTTP_400_BAD_REQUEST)
                
            participant1 = current_user if current_user.id < other_user.id else other_user
            participant2 = other_user if current_user.id < other_user.id else current_user
        else:
            # Non-creator wants to chat with issue creator (default behavior)
            if current_user == issue_creator:
                # Creator trying to access chat without specifying user - return empty
                return Response([])
                
            participant1 = current_user if current_user.id < issue_creator.id else issue_creator
            participant2 = issue_creator if current_user.id < issue_creator.id else current_user
        
        private_chat, created = IssuePrivateChat.objects.get_or_create(
            issue=issue,
            participant1=participant1,
            participant2=participant2,
            defaults={
                'issue': issue,
                'participant1': participant1,
                'participant2': participant2
            }
        )
        
        messages = IssuePrivateMessage.objects.filter(chat=private_chat).order_by('created_at')
        
        # Format messages for frontend
        message_data = []
        for msg in messages:
            message_data.append({
                'id': msg.id,
                'text': msg.text,
                'sender': msg.sender.username,
                'is_sender': msg.sender == request.user,
                'created_at': msg.created_at.isoformat(),
            })
        
        return Response(message_data)

    def post(self, request, issue_id):
        """Send a message to private issue chat"""
        issue = get_object_or_404(Issue, id=issue_id)
        current_user = request.user
        issue_creator = issue.user
        
        # Get the other user ID from request data (for creators to specify who to message)
        other_user_id = request.data.get('user_id')
        
        if other_user_id:
            # Creator wants to message a specific user
            try:
                
                other_user = User.objects.get(id=other_user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Don't allow user to message themselves
            if current_user == other_user:
                return Response({'error': 'Cannot message yourself'}, status=status.HTTP_400_BAD_REQUEST)
                
            participant1 = current_user if current_user.id < other_user.id else other_user
            participant2 = other_user if current_user.id < other_user.id else current_user
        else:
            # Non-creator wants to message issue creator (default behavior)
            if current_user == issue_creator:
                return Response({'error': 'Creator must specify user_id to message someone'}, status=status.HTTP_400_BAD_REQUEST)
                
            participant1 = current_user if current_user.id < issue_creator.id else issue_creator
            participant2 = issue_creator if current_user.id < issue_creator.id else current_user
        
        private_chat, created = IssuePrivateChat.objects.get_or_create(
            issue=issue,
            participant1=participant1,
            participant2=participant2,
            defaults={
                'issue': issue,
                'participant1': participant1,
                'participant2': participant2
            }
        )
        
        # Create message
        message = IssuePrivateMessage.objects.create(
            chat=private_chat,
            sender=request.user,
            text=request.data.get('text', '')
        )
        
        # Create notification for the other participant only
        other_participant = private_chat.get_other_participant(current_user)
        Notification.objects.create(
            recipient=other_participant,
            sender=current_user,
            notification_type='issue_message',
            issue=issue,
            message=f"New private message from {current_user.username} on issue '{issue.title}': {message.text[:50]}..."
        )
        
        # Return formatted message
        return Response({
            'id': message.id,
            'text': message.text,
            'sender': message.sender.username,
            'is_sender': True,
            'created_at': message.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


class JobConversationsView(APIView):
    """Get all users who have conversations with the current user for a specific job"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, job_id):
        from django.db import models
        
        job = get_object_or_404(Job, id=job_id)
        current_user = request.user
        
        # Find all private chats involving this user and job
        chats = JobPrivateChat.objects.filter(
            job=job
        ).filter(
            models.Q(participant1=current_user) | models.Q(participant2=current_user)
        ).select_related('participant1', 'participant2')
        
        conversations = []
        for chat in chats:
            other_user = chat.get_other_participant(current_user)
            
            # Get the latest message from this conversation
            latest_message = JobPrivateMessage.objects.filter(chat=chat).order_by('-created_at').first()
            
            conversations.append({
                'user_id': other_user.id,
                'username': other_user.username,
                'latest_message': {
                    'text': latest_message.text if latest_message else 'No messages yet',
                    'created_at': latest_message.created_at.isoformat() if latest_message else None,
                    'sender': latest_message.sender.username if latest_message else None
                } if latest_message else None
            })
        
        return Response(conversations)


class IssueConversationsView(APIView):
    """Get all users who have conversations with the current user for a specific issue"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, issue_id):
        from django.db import models
        
        issue = get_object_or_404(Issue, id=issue_id)
        current_user = request.user
        
        # Find all private chats involving this user and issue
        chats = IssuePrivateChat.objects.filter(
            issue=issue
        ).filter(
            models.Q(participant1=current_user) | models.Q(participant2=current_user)
        ).select_related('participant1', 'participant2')
        
        conversations = []
        for chat in chats:
            other_user = chat.get_other_participant(current_user)
            
            # Get the latest message from this conversation
            latest_message = IssuePrivateMessage.objects.filter(chat=chat).order_by('-created_at').first()
            
            conversations.append({
                'user_id': other_user.id,
                'username': other_user.username,
                'latest_message': {
                    'text': latest_message.text if latest_message else 'No messages yet',
                    'created_at': latest_message.created_at.isoformat() if latest_message else None,
                    'sender': latest_message.sender.username if latest_message else None
                } if latest_message else None
            })
        
        return Response(conversations)
