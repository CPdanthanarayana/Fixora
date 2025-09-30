import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../components/NotificationDropdown";
import { useNotifications } from "../hooks/useNotifications";

function Profile() {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      setLoading(false);
    }
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-600">Username</h3>
            <p className="text-gray-900 font-medium">{user.username}</p>
          </div>
          <div>
            <h3 className="text-gray-600">Email</h3>
            <p className="text-gray-900 font-medium">{user.email}</p>
          </div>
          <div>
            <h3 className="text-gray-600">Phone Number</h3>
            <p className="text-gray-900 font-medium">
              {user.phone_number || "Not provided"}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Account Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-900">My Jobs</h3>
              <p className="text-gray-600">View and manage your job listings</p>
              <button
                onClick={() => navigate("/jobs")}
                className="mt-2 text-indigo-600 hover:text-indigo-800"
              >
                View Jobs →
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-900">My Issues</h3>
              <p className="text-gray-600">Track your reported issues</p>
              <button
                onClick={() => navigate("/issues")}
                className="mt-2 text-indigo-600 hover:text-indigo-800"
              >
                View Issues →
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            Messages & Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h2>

          <div className="bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                      !notification.is_read
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    }`}
                    onClick={async () => {
                      if (!notification.is_read) {
                        await markAsRead(notification.id);
                      }

                      if (notification.notification_type === "job_message") {
                        sessionStorage.setItem("openJobChat", notification.job);
                        navigate("/jobs");
                      } else if (
                        notification.notification_type === "issue_message"
                      ) {
                        sessionStorage.setItem(
                          "openIssueChat",
                          notification.issue
                        );
                        navigate("/issues");
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(
                            notification.created_at
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            notification.created_at
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full ml-3 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 10 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Showing latest 10 notifications
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
