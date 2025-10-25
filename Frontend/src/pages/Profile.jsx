import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../components/NotificationDropdown";
import { useNotifications } from "../hooks/useNotifications";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FaUserTie, FaUserNurse, FaUser } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import JobChatPopup from "../components/JobChatPopup";
import IssueChatPopup from "../components/IssueChatPopup";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showJobChat, setShowJobChat] = useState(false);
  const [showIssueChat, setShowIssueChat] = useState(false);
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
          const userJobs = allJobs.filter(
            (job) => job.user_id === user.id || job.created_by === user.id
          );
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
        const allIssuesResponse = await fetch(
          "http://localhost:8000/api/issues/",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (allIssuesResponse.ok) {
          const allIssues = await allIssuesResponse.json();
          const userIssues = allIssues.filter(
            (issue) => issue.user === user.id
          );
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

  const handleJobChat = (job) => {
    setSelectedJob(job);
    setShowJobChat(true);
  };

  const handleIssueChat = (issue) => {
    setSelectedIssue(issue);
    setShowIssueChat(true);
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
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-white shadow rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 md:mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            My Profile
          </h1>
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationDropdown />
            <button
              onClick={handleLogout}
              className="px-3 md:px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-sm md:text-base"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Section - Mobile First Design */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            {/* Profile Photo - Centered */}
            <div className="flex justify-center mb-4">
              {user.profile_picture ? (
                <img
                  src={
                    typeof user.profile_picture === "string"
                      ? user.profile_picture
                      : URL.createObjectURL(user.profile_picture)
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-3 border-gray-300 shadow-lg"
                />
              ) : user.selected_avatar ? (
                <div className="w-24 h-24 rounded-full bg-white border-3 border-gray-300 shadow-lg flex items-center justify-center">
                  {user.selected_avatar === "male" ? (
                    <FaUserTie className="w-12 h-12 text-gray-600" />
                  ) : user.selected_avatar === "female" ? (
                    <FaUserNurse className="w-12 h-12 text-gray-600" />
                  ) : (
                    <FaUser className="w-12 h-12 text-gray-600" />
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 border-3 border-gray-300 shadow-lg flex items-center justify-center">
                  <FaUser className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>

            {/* Username - Centered */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              {user.username}
            </h2>

            {/* Profile Details - Card Style */}
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {user.phone_number || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">
                      Location
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {user.location || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    {user.selected_avatar === "male" ? (
                      <FaUserTie className="w-4 h-4 text-purple-600" />
                    ) : user.selected_avatar === "female" ? (
                      <FaUserNurse className="w-4 h-4 text-purple-600" />
                    ) : (
                      <FaUser className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">
                      Profile Type
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {user.selected_avatar === "male"
                        ? "Male"
                        : user.selected_avatar === "female"
                        ? "Female"
                        : user.profile_picture
                        ? "Custom Photo"
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Same Card Design */}
          <div className="hidden md:flex items-start gap-12">
            {/* Profile Photo - Left Side */}
            <div className="flex-shrink-0">
              {user.profile_picture ? (
                <img
                  src={
                    typeof user.profile_picture === "string"
                      ? user.profile_picture
                      : URL.createObjectURL(user.profile_picture)
                  }
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : user.selected_avatar ? (
                <div className="w-40 h-40 rounded-full bg-white border-4 border-gray-300 shadow-lg flex items-center justify-center">
                  {user.selected_avatar === "male" ? (
                    <FaUserTie className="w-20 h-20 text-gray-600" />
                  ) : user.selected_avatar === "female" ? (
                    <FaUserNurse className="w-20 h-20 text-gray-600" />
                  ) : (
                    <FaUser className="w-20 h-20 text-gray-600" />
                  )}
                </div>
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-100 border-4 border-gray-300 shadow-lg flex items-center justify-center">
                  <FaUser className="w-20 h-20 text-gray-500" />
                </div>
              )}
            </div>

            {/* Profile Details - Right Side with Card Design */}
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {user.username}
              </h2>

              {/* Profile Details - Card Style for Desktop */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <p className="text-lg text-gray-900 font-medium">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">Phone</p>
                      <p className="text-lg text-gray-900 font-medium">
                        {user.phone_number || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">
                        Location
                      </p>
                      <p className="text-lg text-gray-900 font-medium">
                        {user.location || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      {user.selected_avatar === "male" ? (
                        <FaUserTie className="w-6 h-6 text-purple-600" />
                      ) : user.selected_avatar === "female" ? (
                        <FaUserNurse className="w-6 h-6 text-purple-600" />
                      ) : (
                        <FaUser className="w-6 h-6 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">
                        Profile Type
                      </p>
                      <p className="text-lg text-gray-900 font-medium">
                        {user.selected_avatar === "male"
                          ? "Male"
                          : user.selected_avatar === "female"
                          ? "Female"
                          : user.profile_picture
                          ? "Custom Photo"
                          : "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Activity
          </h2>
          {/* Mobile Activity Cards */}
          <div className="block md:hidden space-y-3">
            <div
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={toggleMyServices}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-teal-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 8v10l4-2 4 2V8"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Services</h3>
                    <p className="text-sm text-gray-500">
                      {myJobs.length} services
                    </p>
                  </div>
                </div>
                <div className="text-teal-600">
                  <svg
                    className={`w-5 h-5 transform transition ${
                      showMyServices ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={toggleMyProblems}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Problems</h3>
                    <p className="text-sm text-gray-500">
                      {myIssues.length} problems
                    </p>
                  </div>
                </div>
                <div className="text-orange-600">
                  <svg
                    className={`w-5 h-5 transform transition ${
                      showMyProblems ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Activity Cards */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            <div
              className="bg-teal-50 p-4 rounded hover:bg-teal-100 transition cursor-pointer"
              onClick={toggleMyServices}
            >
              <h3 className="font-medium text-gray-900">
                My Services ({myJobs.length})
              </h3>
              <p className="text-gray-600 text-sm">
                View and manage your service listings
              </p>
              <span className="mt-2 text-teal-500 hover:text-teal-600 text-sm">
                {showMyServices ? "Hide Services ↑" : "Show My Services ↓"}
              </span>
            </div>
            <div
              className="bg-orange-50 p-4 rounded hover:bg-orange-100 transition cursor-pointer"
              onClick={toggleMyProblems}
            >
              <h3 className="font-medium text-gray-900">
                My Problems ({myIssues.length})
              </h3>
              <p className="text-gray-600 text-sm">
                Track your reported problems
              </p>
              <span className="mt-2 text-orange-500 hover:text-orange-600 text-sm">
                {showMyProblems ? "Hide Problems ↑" : "Show My Problems ↓"}
              </span>
            </div>
          </div>

          {/* My Services Section */}
          {showMyServices && (
            <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4">
                <h3 className="text-lg font-semibold text-white">
                  My Services
                </h3>
              </div>
              <div className="p-4">
                {jobsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
                  </div>
                ) : myJobs.length > 0 ? (
                  <>
                    {/* Mobile: Stack cards vertically */}
                    <div className="block md:hidden space-y-3">
                      {myJobs.map((job) => (
                        <div
                          key={job.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative cursor-pointer hover:shadow-md transition min-h-[200px] flex flex-col"
                          onClick={() => {
                            sessionStorage.setItem("highlightJobId", job.id);
                            navigate("/jobs");
                          }}
                        >
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJobChat(job);
                              }}
                              className="w-8 h-8 bg-teal-100 hover:bg-teal-200 rounded-full flex items-center justify-center text-teal-600 transition"
                              title="Chat about this service"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Delete job:", job.id);
                              }}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center text-red-600 transition"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="pr-20 flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                              {job.title}
                            </h4>
                            <p className="text-sm text-teal-600 font-medium mb-2">
                              {job.category}
                            </p>
                            <p className="text-sm text-gray-700 mb-3 line-clamp-3 md:line-clamp-4 lg:line-clamp-5">
                              {job.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center pr-20 mt-auto">
                            <span className="text-lg font-bold text-gray-900">
                              {job.salary ? `Rs. ${job.salary}` : "Negotiable"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(
                                job.created_at || Date.now()
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop: Use Swiper */}
                    <div className="hidden md:block">
                      <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        breakpoints={{
                          640: { slidesPerView: 2 },
                          768: { slidesPerView: 3 },
                        }}
                      >
                        {myJobs.map((job) => (
                          <SwiperSlide key={job.id}>
                            <div
                              className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-400 relative cursor-pointer hover:shadow-md transition min-h-[200px] flex flex-col"
                              onClick={() => {
                                sessionStorage.setItem(
                                  "highlightJobId",
                                  job.id
                                );
                                navigate("/jobs");
                              }}
                            >
                              <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJobChat(job);
                                  }}
                                  className="p-1.5 bg-teal-100 hover:bg-teal-200 rounded-full text-teal-600 transition"
                                  title="Chat about this service"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Delete job:", job.id);
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <div className="pr-16 flex-1">
                                <h4 className="font-semibold text-gray-900 line-clamp-2">
                                  {job.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {job.category}
                                </p>
                                <p className="text-sm text-gray-700 mt-2 line-clamp-4 lg:line-clamp-5">
                                  {job.description}
                                </p>
                              </div>
                              <div className="mt-3 flex justify-between items-center pr-16">
                                <span className="text-sm font-medium text-gray-600">
                                  {job.salary
                                    ? `Rs. ${job.salary}`
                                    : "Negotiable"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    job.created_at || Date.now()
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 8v10l4-2 4 2V8"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500">No services posted yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Problems Section */}
          {showMyProblems && (
            <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                <h3 className="text-lg font-semibold text-white">
                  My Problems
                </h3>
              </div>
              <div className="p-4">
                {issuesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
                  </div>
                ) : myIssues.length > 0 ? (
                  <>
                    {/* Mobile: Stack cards vertically */}
                    <div className="block md:hidden space-y-3">
                      {myIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative cursor-pointer hover:shadow-md transition min-h-[200px] flex flex-col"
                          onClick={() => {
                            sessionStorage.setItem(
                              "highlightIssueId",
                              issue.id
                            );
                            navigate("/issues");
                          }}
                        >
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIssueChat(issue);
                              }}
                              className="w-8 h-8 bg-orange-100 hover:bg-orange-200 rounded-full flex items-center justify-center text-orange-600 transition"
                              title="Chat about this problem"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Delete issue:", issue.id);
                              }}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center text-red-600 transition"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="pr-20 flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                              {issue.title}
                            </h4>
                            <p className="text-sm text-orange-600 font-medium mb-2">
                              {issue.category_name}
                            </p>
                            <p className="text-sm text-gray-700 mb-3 line-clamp-3 md:line-clamp-4 lg:line-clamp-5">
                              {issue.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center pr-20 mt-auto">
                            <span className="text-lg font-bold text-gray-900">
                              {issue.salary
                                ? `Rs. ${issue.salary}`
                                : "Negotiable"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(
                                issue.created_at || Date.now()
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop: Use Swiper */}
                    <div className="hidden md:block">
                      <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        breakpoints={{
                          640: { slidesPerView: 2 },
                          768: { slidesPerView: 3 },
                        }}
                      >
                        {myIssues.map((issue) => (
                          <SwiperSlide key={issue.id}>
                            <div
                              className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400 relative cursor-pointer hover:shadow-md transition min-h-[200px] flex flex-col"
                              onClick={() => {
                                sessionStorage.setItem(
                                  "highlightIssueId",
                                  issue.id
                                );
                                navigate("/issues");
                              }}
                            >
                              <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleIssueChat(issue);
                                  }}
                                  className="w-7 h-7 bg-orange-100 hover:bg-orange-200 rounded-full flex items-center justify-center text-orange-600 transition"
                                  title="Chat about this problem"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Delete issue:", issue.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <div className="pr-16 flex-1">
                                <h4 className="font-semibold text-gray-900 line-clamp-2">
                                  {issue.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {issue.category_name}
                                </p>
                                <p className="text-sm text-gray-700 mt-2 line-clamp-4 lg:line-clamp-5">
                                  {issue.description}
                                </p>
                              </div>
                              <div className="mt-3 flex justify-between items-center pr-16">
                                <span className="text-sm font-medium text-gray-600">
                                  {issue.salary
                                    ? `Rs. ${issue.salary}`
                                    : "Negotiable"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    issue.created_at || Date.now()
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500">No problems reported yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Section */}
        <div className="mt-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Messages & Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-white text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-5 5-5-5h5zm0 0V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div>
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                        !notification.is_read
                          ? "bg-blue-50 border-l-4 border-l-blue-400"
                          : ""
                      }`}
                      onClick={async () => {
                        if (!notification.is_read) {
                          await markAsRead(notification.id);
                        }

                        if (notification.notification_type === "job_message") {
                          sessionStorage.setItem(
                            "openJobChat",
                            notification.job
                          );
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
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            !notification.is_read
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <svg
                            className={`w-5 h-5 ${
                              !notification.is_read
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              !notification.is_read
                                ? "text-gray-900"
                                : "text-gray-600"
                            }`}
                          >
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
                          <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 10 && (
              <div className="p-4 bg-gray-50 text-center border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing latest 10 notifications
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Popups */}
      {showJobChat && selectedJob && (
        <JobChatPopup
          isOpen={showJobChat}
          onClose={() => {
            setShowJobChat(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
        />
      )}

      {showIssueChat && selectedIssue && (
        <IssueChatPopup
          isOpen={showIssueChat}
          onClose={() => {
            setShowIssueChat(false);
            setSelectedIssue(null);
          }}
          issue={selectedIssue}
        />
      )}
    </div>
  );
}

export default Profile;
