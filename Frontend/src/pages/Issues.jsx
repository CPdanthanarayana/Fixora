import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import IssueCard from "../components/IssueCard";
import IssueForm from "../components/IssueForm";
import IssueChatPopup from "../components/IssueChatPopup";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const { token, refreshToken } = useAuth();
  const navigate = useNavigate();

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

  // Fetch issues from backend
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

        console.log("Received issues:", data);
        setIssues(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchIssues();
  }, [token, navigate, refreshToken]);

  const handleChat = (issue) => {
    setSelectedIssue(issue);
    setShowChat(true);
  };

  const handleAddIssue = async (formData) => {
    try {
      const makeRequest = async (currentToken) => {
        const response = await fetch("http://localhost:8000/api/issues/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({
            ...formData,
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
      {/* Add Issue Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
        >
          + Add Issue
        </button>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} onChat={handleChat} />
        ))}
        {issues.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">
            No issues found. Click "Add Issue" to create one.
          </p>
        )}
      </div>

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
