import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export const useNotifications = () => {
  const { token, refreshToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8000/api/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else if (response.status === 401 || response.status === 403) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newToken = localStorage.getItem("token");
          const retry = await fetch(
            "http://localhost:8000/api/notifications/",
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          if (retry.ok) {
            const data = await retry.json();
            setNotifications(data);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        "http://localhost:8000/api/notifications/unread-count/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      } else if (response.status === 401 || response.status === 403) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newToken = localStorage.getItem("token");
          const retry = await fetch(
            "http://localhost:8000/api/notifications/unread-count/",
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          if (retry.ok) {
            const data = await retry.json();
            setUnreadCount(data.count);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/notifications/${notificationId}/mark-read/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        // Refresh unread count
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Refresh notifications more frequently (every 10 seconds) to catch new messages
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [token]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  };
};
