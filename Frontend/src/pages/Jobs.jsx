import { useState, useEffect } from "react";
import JobCard from "../components/JobCard";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs/");
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        setJobs(data);
        setLoading(false);
      } catch (err) {
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

  const handleAddJob = async () => {
    try {
      const response = await fetch("/api/jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add your authentication token here
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: "New Job",
          description: "Job description",
          status: "open",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create job");
      }

      const newJob = await response.json();
      setJobs([newJob, ...jobs]);
    } catch (err) {
      console.error("Error creating job:", err);
      alert("Failed to create job. Please try again.");
    }
  };

  return (
    <div className="p-6">
      {/* Add Job Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleAddJob}
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
    </div>
  );
}
