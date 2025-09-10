# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from Backend.chat.models import ChatRoom, Message
from Backend.jobs.models import Job
from Backend.issues.models import Issue

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.issue_id = self.scope['url_route']['kwargs']['issue_id']
        self.job_id = self.scope['url_route']['kwargs']['job_id']
        self.room_group_name = f"chat_{self.issue_id}_{self.job_id}"

        # Check authentication
        user = self.scope["user"]
        if user is None or isinstance(user, AnonymousUser):
            await self.close()
            return

        # Validate room (only issue.user or job.user can connect)
        is_allowed = await self.is_user_allowed(user)
        if not is_allowed:
            await self.close()
            return

        # Join group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data["message"]
        user = self.scope["user"]

        # Save message in DB
        msg = await self.save_message(user, message)

        # Broadcast
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": msg.text,
                "sender": user.username,
                "timestamp": msg.created_at.isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    # DB helpers
    @database_sync_to_async
    def is_user_allowed(self, user):
        try:
            issue = Issue.objects.get(id=self.issue_id)
            job = Job.objects.get(id=self.job_id)
            room, created = ChatRoom.objects.get_or_create(issue=issue, job=job)
            return user == issue.user or user == job.user
        except Issue.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, user, text):
        issue = Issue.objects.get(id=self.issue_id)
        job = Job.objects.get(id=self.job_id)
        room, created = ChatRoom.objects.get_or_create(issue=issue, job=job)
        return Message.objects.create(room=room, sender=user, text=text)
