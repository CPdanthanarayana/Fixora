import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import IssueCard from "../components/IssueCard";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Fetch issues from backend
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch("/api/issues/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch issues");
        const data = await response.json();
        setIssues(data);
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchIssues();
    }
  }, [token]);

  const handleChat = (issue) => {
    alert(`Open chat with issue: ${issue.title}`);
    // Later → open ChatPopup
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
          onClick={() => (window.location.href = "/issues/new")}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
        >
          + Add Issue
        </button>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} onChat={handleChat} />
        ))}
        {issues.length === 0 && (
          <p className="text-gray-500 col-span-2 text-center py-8">
            No issues found. Click "Add Issue" to create one.
          </p>
        )}
      </div>
    </div>
  );
}
