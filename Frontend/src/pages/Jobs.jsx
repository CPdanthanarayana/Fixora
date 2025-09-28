import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import JobCard from "../components/JobCard";
import JobForm from "../components/JobForm";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/jobs/");
        const textResponse = await response.text();
        console.log("Fetch response:", textResponse);

        let data;
        try {
          data = JSON.parse(textResponse);
        } catch (e) {
          console.error("Failed to parse jobs response:", textResponse);
          throw new Error("Invalid response from server");
        }

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch jobs");
        }

        setJobs(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleChat = (job) => {
    alert(`Open chat with job: ${job.title}`);
    // Later → open ChatPopup
  };

  const handleAddJob = async (formData) => {
    try {
      console.log("Sending job data:", formData);
      const response = await fetch("http://localhost:8000/api/jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          status: "open",
        }),
      });

      const textResponse = await response.text();
      console.log("Server response:", textResponse);

      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        console.error("Failed to parse response as JSON:", textResponse);
        throw new Error("Server sent an invalid response");
      }

      if (!response.ok) {
        const errorMessage =
          data.detail || data.message || "Failed to create job";
        console.error("Server error:", data);
        throw new Error(errorMessage);
      }

      setJobs([data, ...jobs]);
      alert("Job created successfully!");
    } catch (err) {
      console.error("Error creating job:", err);
      alert(err.message || "Failed to create job. Please try again.");
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onChat={handleChat} />
        ))}
      </div>

      <JobForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={async (formData) => {
          await handleAddJob(formData);
          setShowForm(false);
        }}
      />
    </div>
  );
}
