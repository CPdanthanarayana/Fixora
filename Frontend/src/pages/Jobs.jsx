import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import JobCard from "../components/JobCard";
import JobForm from "../components/JobForm";
import JobChatPopup from "../components/JobChatPopup";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const { token, refreshToken } = useAuth();
  const navigate = useNavigate();

  // Function to make API request with token
  const makeRequest = async (currentToken, formData) => {
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

    if (response.status === 401) {
      throw new Error("token_expired");
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.message || "Failed to create job");
    }

    return data;
  };

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

        console.log("Received jobs:", data);
        setJobs(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token, navigate, refreshToken]);

  const handleChat = (job) => {
    setSelectedJob(job);
    setShowChat(true);
  };

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

  return (
    <div className="p-6">
      {/* Add Job Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
        >
          + Add Job
        </button>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onChat={handleChat} />
        ))}
      </div>

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
