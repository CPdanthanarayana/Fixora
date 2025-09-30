import { useState, useEffect, useRef } from "react";
import { X, Send, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

function JobChatPopup({ isOpen, onClose, job }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const messagesEndRef = useRef(null);
  const { token, user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && job) {
      fetchConversations();
    }
  }, [isOpen, job]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/chat/job/${job.id}/conversations/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data);

        // If current user is the creator and there are conversations
        if (user?.id === job.created_by && data.length > 0) {
          if (data.length === 1) {
            // Only one conversation, select it automatically
            setSelectedUserId(data[0].user_id);
            fetchMessages(data[0].user_id);
          } else {
            // Multiple conversations, show selection
            setShowUserSelection(true);
          }
        } else {
          // User is not the creator, fetch messages normally
          fetchMessages();
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      // Fallback to fetching messages normally
      fetchMessages();
    }
  };

  const fetchMessages = async (userId = null) => {
    try {
      const url = userId
        ? `http://localhost:8000/api/chat/job/${job.id}/messages/?user_id=${userId}`
        : `http://localhost:8000/api/chat/job/${job.id}/messages/`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const body = { text: newMessage };

      // If current user is the creator and has selected a user, include user_id
      if (user?.id === job.created_by && selectedUserId) {
        body.user_id = selectedUserId;
      }

      const response = await fetch(
        `http://localhost:8000/api/chat/job/${job.id}/messages/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data]);
        setNewMessage("");
      } else {
        const errorData = await response.json();
        console.error("Error sending message:", errorData);
        alert(errorData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectUser = (userId, username) => {
    setSelectedUserId(userId);
    setShowUserSelection(false);
    fetchMessages(userId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md h-96 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Chat about: {job?.title}
            </h3>
            <p className="text-sm text-gray-500">{job?.category}</p>
            {selectedUserId && conversations.length > 0 && (
              <p className="text-xs text-indigo-600">
                Chatting with:{" "}
                {
                  conversations.find((c) => c.user_id === selectedUserId)
                    ?.username
                }
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {user?.id === job.created_by && conversations.length > 1 && (
              <button
                onClick={() => setShowUserSelection(!showUserSelection)}
                className="text-gray-500 hover:text-gray-700"
                title="Select user to chat with"
              >
                <Users className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* User Selection Dropdown */}
        {showUserSelection && (
          <div className="p-4 border-b bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Select user to chat with:
            </h4>
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.user_id}
                  onClick={() =>
                    selectUser(conversation.user_id, conversation.username)
                  }
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-indigo-100 flex items-center justify-between"
                >
                  <span>{conversation.username}</span>
                  <span className="text-xs text-gray-500">
                    {conversation.latest_message
                      ? conversation.latest_message.text.slice(0, 30) + "..."
                      : "No messages"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {showUserSelection ? (
            <div className="text-center text-gray-500 py-8">
              Select a user above to view the conversation
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.is_sender ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.is_sender
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                showUserSelection
                  ? "Select a user first..."
                  : "Type your message..."
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={loading || showUserSelection}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !newMessage.trim() || showUserSelection}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobChatPopup;
