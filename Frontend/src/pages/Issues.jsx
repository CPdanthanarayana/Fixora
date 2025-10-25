import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import IssueCard from "../components/IssueCard";
import IssueForm from "../components/IssueForm";
import IssueChatPopup from "../components/IssueChatPopup";
import { Search, Filter } from "lucide-react";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [highlightedIssueId, setHighlightedIssueId] = useState(null);
  const { token, refreshToken, user } = useAuth();
  const navigate = useNavigate();

  // Check for highlighted issue from profile
  useEffect(() => {
    const issueIdToHighlight = sessionStorage.getItem("highlightIssueId");
    if (issueIdToHighlight) {
      setHighlightedIssueId(parseInt(issueIdToHighlight));
      sessionStorage.removeItem("highlightIssueId");

      // Scroll to the highlighted issue after a short delay
      setTimeout(() => {
        const element = document.getElementById(`issue-${issueIdToHighlight}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);

      // Remove highlight after 2 seconds (zoom animation completes, shadow stays)
      setTimeout(() => {
        setHighlightedIssueId(null);
      }, 4000);
    }
  }, [issues]);

  // Check for auto-open chat from notifications
  useEffect(() => {
    const issueIdToOpen = sessionStorage.getItem("openIssueChat");
    if (issueIdToOpen && issues.length > 0) {
      const issue = issues.find((i) => i.id.toString() === issueIdToOpen);
      if (issue) {
        handleChat(issue);
        sessionStorage.removeItem("openIssueChat");
      }
    }
  }, [issues]);

  // Fetch issues(problems) from backend
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchIssues = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/issues/", {
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
            const newResponse = await fetch(
              "http://localhost:8000/api/issues/",
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );

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
              throw new Error(newData.detail || "Failed to fetch issues");
            }
            setIssues(newData);
            setLoading(false);
            return;
          } else {
            navigate("/login");
            return;
          }
        }

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch issues");
        }

        setIssues(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };

    fetchIssues();
  }, [token, navigate, refreshToken]);

  const handleChat = (issue) => {
    setSelectedIssue(issue);
    setShowChat(true);
  };

  // Filter issues based on search term and selected filter
  const filteredIssues = issues.filter((issue) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    switch (searchFilter) {
      case "title":
        return issue.title?.toLowerCase().includes(searchLower);
      case "category":
        return issue.category?.toLowerCase().includes(searchLower);
      case "description":
        return issue.description?.toLowerCase().includes(searchLower);
      case "all":
      default:
        return (
          issue.title?.toLowerCase().includes(searchLower) ||
          issue.category?.toLowerCase().includes(searchLower) ||
          issue.description?.toLowerCase().includes(searchLower)
        );
    }
  });

  const handleDeleteIssue = async (issue) => {
    if (!confirm(`Are you sure you want to delete "${issue.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/issues/${issue.id}/`,
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
            `http://localhost:8000/api/issues/${issue.id}/`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (newResponse.ok) {
            setIssues(issues.filter((i) => i.id !== issue.id));
            alert("Problem deleted successfully!");
          } else {
            throw new Error("Failed to delete problem");
          }
        } else {
          navigate("/login");
        }
      } else if (response.ok) {
        setIssues(issues.filter((i) => i.id !== issue.id));
        alert("Problem deleted successfully!");
      } else {
        throw new Error("Failed to delete problem");
      }
    } catch (err) {
      console.error("Error deleting issue:", err);
      alert(err.message || "Failed to delete problem. Please try again.");
    }
  };

  const handleAddIssue = async (formData) => {
    try {
      const makeRequest = async (currentToken) => {
        // Prepare the data, converting salary to number or null
        const issueData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          status: "open",
        };

        console.log("Sending issue data:", issueData);

        const response = await fetch("http://localhost:8000/api/issues/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify(issueData),
        });

        const data = await response.json();

        if (response.status === 401) {
          // Token expired
          throw new Error("token_expired");
        }

        if (!response.ok) {
          throw new Error(
            data.detail || data.message || "Failed to create issue"
          );
        }

        return data;
      };

      try {
        // First attempt with current token
        const data = await makeRequest(token);
        setIssues([data, ...issues]);
        alert("Issue created successfully!");
        return true;
      } catch (error) {
        if (error.message === "token_expired") {
          // Try to refresh token and make request again
          const refreshed = await refreshToken();

          if (refreshed) {
            // Retry with new token from localStorage since refreshToken updates it
            const data = await makeRequest(localStorage.getItem("token"));
            setIssues([data, ...issues]);
            alert("Issue created successfully!");
            return true;
          } else {
            throw new Error("Session expired. Please login again.");
          }
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.error("Error creating issue:", err);
      alert(err.message || "Failed to create issue. Please try again.");

      if (err.message.includes("Session expired")) {
        // Redirect to login if session is expired
        navigate("/login");
      }
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header: Available Problems + Post New Problem button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Available Problems
        </h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-md shadow hover:opacity-95 transition text-sm font-medium"
          aria-label="Post New Problem"
        >
          Post New Problem
        </button>
      </div>

      {/* Search Bar with Filter */}
      <div className="mb-6">
        <div className="flex gap-3 max-w-2xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search problems by ${
                searchFilter === "all"
                  ? "title, category, or description"
                  : searchFilter
              }...`}
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

      {/* Issues Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            id={`issue-${issue.id}`}
            className={`rounded-2xl transform-gpu transition-all duration-700 ${
              highlightedIssueId === issue.id
                ? "shadow-[0_0_30px_rgba(249,115,22,0.6)]"
                : ""
            }`}
            style={{
              animation:
                highlightedIssueId === issue.id
                  ? "zoomInOut 1s ease-in-out"
                  : "none",
            }}
          >
            <IssueCard
              issue={issue}
              onChat={handleChat}
              onDelete={handleDeleteIssue}
              currentUserId={user?.id}
            />
          </div>
        ))}
        {filteredIssues.length === 0 && issues.length > 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">
            No problems found matching "{searchTerm}". Try different keywords.
          </p>
        )}
        {issues.length === 0 && !loading && (
          <p className="text-gray-500 col-span-full text-center py-8">
            No problems found. Click "Post New Problem" to create one.
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

      <IssueForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={async (formData) => {
          const success = await handleAddIssue(formData);
          if (success) {
            setShowForm(false);
          }
        }}
      />

      <IssueChatPopup
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        issue={selectedIssue}
      />
    </div>
  );
}
