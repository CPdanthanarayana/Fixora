import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import JobCard from "../components/JobCard";
import JobForm from "../components/JobForm";
import JobChatPopup from "../components/JobChatPopup";
import { Search, Filter } from "lucide-react";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [highlightedJobId, setHighlightedJobId] = useState(null);
  const { token, refreshToken, user } = useAuth();
  const navigate = useNavigate();

  // Check for highlighted job from profile
  useEffect(() => {
    const jobIdToHighlight = sessionStorage.getItem("highlightJobId");
    if (jobIdToHighlight) {
      setHighlightedJobId(parseInt(jobIdToHighlight));
      sessionStorage.removeItem("highlightJobId");

      // Scroll to the highlighted job after a short delay
      setTimeout(() => {
        const element = document.getElementById(`job-${jobIdToHighlight}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);

      // Remove highlight after 2 seconds (zoom animation completes, shadow stays)
      setTimeout(() => {
        setHighlightedJobId(null);
      }, 4000);
    }
  }, [jobs]);

  // Check for auto-open chat from notifications
  useEffect(() => {
    const jobIdToOpen = sessionStorage.getItem("openJobChat");
    if (jobIdToOpen && jobs.length > 0) {
      const job = jobs.find((j) => j.id.toString() === jobIdToOpen);
      if (job) {
        handleChat(job);
        sessionStorage.removeItem("openJobChat");
      }
    }
  }, [jobs]);

  // Fetch jobs from backend
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/jobs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        let data;
        try {
          data = await response.json();
        } catch (e) {
          console.error("Failed to parse response:", e);
          throw new Error("Invalid response from server");
        }

        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry with new token
            const newToken = localStorage.getItem("token");
            const newResponse = await fetch("http://localhost:8000/api/jobs/", {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
            });

            let newData;
            try {
              newData = await newResponse.json();
            } catch (e) {
              console.error("Failed to parse response after token refresh:", e);
              throw new Error(
                "Invalid response from server after token refresh"
              );
            }

            if (!newResponse.ok) {
              throw new Error(newData.detail || "Failed to fetch jobs");
            }
            setJobs(newData);
            setLoading(false);
            return;
          } else {
            navigate("/login");
            return;
          }
        }

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch jobs");
        }

        setJobs(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token, navigate, refreshToken]);

  const handleChat = (job) => {
    setSelectedJob(job);
    setShowChat(true);
  };

  // Filter jobs(services) based on search term and selected filter
  const filteredJobs = jobs.filter((job) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    switch (searchFilter) {
      case "title":
        return job.title?.toLowerCase().includes(searchLower);
      case "category":
        return (
          job.category?.toLowerCase().includes(searchLower) ||
          job.category_name?.toLowerCase().includes(searchLower)
        );
      case "description":
        return job.description?.toLowerCase().includes(searchLower);
      case "price":
        return job.salary?.toString().includes(searchTerm);
      case "all":
      default:
        return (
          job.title?.toLowerCase().includes(searchLower) ||
          job.category?.toLowerCase().includes(searchLower) ||
          job.category_name?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower) ||
          job.salary?.toString().includes(searchTerm)
        );
    }
  });

  // Handle adding a new job(services) with token refresh logic
  const handleAddJob = async (formData) => {
    try {
      const makeRequest = async (currentToken) => {
        const response = await fetch("http://localhost:8000/api/jobs/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({
            ...formData,
            salary: formData.salary ? formData.salary.toString() : "",
            status: "open",
          }),
        });

        const data = await response.json();

        if (response.status === 401) {
          // Token expired
          throw new Error("token_expired");
        }

        if (!response.ok) {
          throw new Error(
            data.detail || data.message || "Failed to create job"
          );
        }

        return data;
      };

      try {
        // First attempt with current token
        const data = await makeRequest(token, formData);
        setJobs([data, ...jobs]);
        alert("Job created successfully!");
        return true;
      } catch (error) {
        if (error.message === "token_expired") {
          // Try to refresh token and make request again
          const refreshed = await refreshToken();

          if (refreshed) {
            // Retry with new token from localStorage since refreshToken updates it
            const data = await makeRequest(
              localStorage.getItem("token"),
              formData
            );
            setJobs([data, ...jobs]);
            alert("Job created successfully!");
            return true;
          } else {
            throw new Error("Session expired. Please login again.");
          }
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.error("Error creating job:", err);
      alert(err.message || "Failed to create job. Please try again.");

      if (err.message.includes("Session expired")) {
        // Redirect to login if session is expired
        navigate("/login");
      }
    }
  };

  const handleDeleteJob = async (job) => {
    if (!confirm(`Are you sure you want to delete "${job.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/jobs/${job.id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newResponse = await fetch(
            `http://localhost:8000/api/jobs/${job.id}/`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (newResponse.ok) {
            setJobs(jobs.filter((j) => j.id !== job.id));
            alert("Service deleted successfully!");
          } else {
            throw new Error("Failed to delete service");
          }
        } else {
          navigate("/login");
        }
      } else if (response.ok) {
        setJobs(jobs.filter((j) => j.id !== job.id));
        alert("Service deleted successfully!");
      } else {
        throw new Error("Failed to delete service");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      alert(err.message || "Failed to delete service. Please try again.");
    }
  };

  return (
    <div className="p-6">
      {/* Header: Available Jobs + Post New Problem button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Available Services
        </h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-md shadow hover:opacity-95 transition text-sm font-medium"
          aria-label="Post New Services"
        >
          Post New Service
        </button>
      </div>

      {/* Search Bar with Filter */}
      <div className="mb-6">
        <div className="flex gap-3 max-w-2xl">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search Services...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full h-10 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="block w-full h-10 pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-orange-500 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 focus:border-orange-600 text-sm appearance-none"
            >
              <option value="all" className="bg-white text-gray-700">
                All Fields
              </option>
              <option value="title" className="bg-white text-gray-700">
                Title
              </option>
              <option value="category" className="bg-white text-gray-700">
                Category
              </option>
              <option value="description" className="bg-white text-gray-700">
                Description
              </option>
              <option value="price" className="bg-white text-gray-700">
                Price
              </option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            id={`job-${job.id}`}
            className={`rounded-2xl transform-gpu transition-all duration-700 ${
              highlightedJobId === job.id
                ? "shadow-[0_0_30px_rgba(20,184,166,0.6)]"
                : ""
            }`}
            style={{
              animation:
                highlightedJobId === job.id
                  ? "zoomInOut 1s ease-in-out"
                  : "none",
            }}
          >
            <JobCard
              job={job}
              onChat={handleChat}
              onDelete={handleDeleteJob}
              currentUserId={user?.id}
            />
          </div>
        ))}
        {filteredJobs.length === 0 && jobs.length > 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">
            No services found matching "{searchTerm}". Try different keywords.
          </p>
        )}
        {jobs.length === 0 && !loading && (
          <p className="text-gray-500 col-span-full text-center py-8">
            No services available. Click "Post New Service" to add one.
          </p>
        )}
      </div>

      <style>{`
        @keyframes zoomInOut {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>

      <JobForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={async (formData) => {
          const success = await handleAddJob(formData);
          if (success) {
            setShowForm(false);
          }
        }}
      />

      <JobChatPopup
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        job={selectedJob}
      />
    </div>
  );
}
