import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../components/NotificationDropdown";
import { useNotifications } from "../hooks/useNotifications";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function Profile() {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMyServices, setShowMyServices] = useState(false);
  const [showMyProblems, setShowMyProblems] = useState(false);
  const [myJobs, setMyJobs] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [issuesLoading, setIssuesLoading] = useState(false);
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

  const fetchMyJobs = async () => {
    setJobsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/jobs/my/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyJobs(data);
      } else {
        // Fallback: filter all jobs by current user
        const allJobsResponse = await fetch("http://localhost:8000/api/jobs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (allJobsResponse.ok) {
          const allJobs = await allJobsResponse.json();
          const userJobs = allJobs.filter(job => job.user_id === user.id || job.created_by === user.id);
          setMyJobs(userJobs);
        }
      }
    } catch (err) {
      console.error("Error fetching my jobs:", err);
    }
    setJobsLoading(false);
  };

  const fetchMyIssues = async () => {
    setIssuesLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/issues/my/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyIssues(data);
      } else {
        // Fallback: filter all issues by current user
        const allIssuesResponse = await fetch("http://localhost:8000/api/issues/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (allIssuesResponse.ok) {
          const allIssues = await allIssuesResponse.json();
          const userIssues = allIssues.filter(issue => issue.user_id === user.id || issue.created_by === user.id);
          setMyIssues(userIssues);
        }
      }
    } catch (err) {
      console.error("Error fetching my issues:", err);
    }
    setIssuesLoading(false);
  };

  const toggleMyServices = () => {
    if (!showMyServices && myJobs.length === 0) {
      fetchMyJobs();
    }
    setShowMyServices(!showMyServices);
    setShowMyProblems(false);
  };

  const toggleMyProblems = () => {
    if (!showMyProblems && myIssues.length === 0) {
      fetchMyIssues();
    }
    setShowMyProblems(!showMyProblems);
    setShowMyServices(false);
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
            My Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded hover:bg-gray-100 transition cursor-pointer" onClick={toggleMyServices}>
              <h3 className="font-medium text-gray-900">My Services ({myJobs.length})</h3>
              <p className="text-gray-600">View and manage your service listings</p>
              <span className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm">
                {showMyServices ? "Hide Services ↑" : "Show My Services ↓"}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded hover:bg-gray-100 transition cursor-pointer" onClick={toggleMyProblems}>
              <h3 className="font-medium text-gray-900">My Problems ({myIssues.length})</h3>
              <p className="text-gray-600">Track your reported problems</p>
              <span className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm">
                {showMyProblems ? "Hide Problems ↑" : "Show My Problems ↓"}
              </span>
            </div>
          </div>

          {/* My Services Swiper */}
          {showMyServices && (
            <div className="mt-6 bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Services</h3>
              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : myJobs.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={20}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 }
                  }}
                >
                  {myJobs.map((job) => (
                    <SwiperSlide key={job.id}>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                        <h4 className="font-semibold text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{job.category}</p>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{job.description}</p>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {job.salary ? `Rs. ${job.salary}` : "Negotiable"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(job.created_at || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <p className="text-gray-500 text-center py-8">No services posted yet</p>
              )}
            </div>
          )}

          {/* My Problems Swiper */}
          {showMyProblems && (
            <div className="mt-6 bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Problems</h3>
              {issuesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : myIssues.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={20}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 }
                  }}
                >
                  {myIssues.map((issue) => (
                    <SwiperSlide key={issue.id}>
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                        <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{issue.category_name}</p>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{issue.description}</p>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {new Date(issue.created_at || Date.now()).toLocaleDateString()}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/issues");
                            }}
                            className="text-xs text-orange-600 hover:text-orange-800"
                          >
                            View →
                          </button>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <p className="text-gray-500 text-center py-8">No problems reported yet</p>
              )}
            </div>
          )}
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
