import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
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
      </div>
    </div>
  );
}

export default Profile;
