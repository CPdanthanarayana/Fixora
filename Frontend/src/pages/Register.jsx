import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    phone_number: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/users/register/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      console.log("Server response:", data);

      if (response.ok) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        // Handle specific error messages
        if (data.username) {
          setError(`Username: ${data.username.join(", ")}`);
        } else if (data.email) {
          setError(`Email: ${data.email.join(", ")}`);
        } else if (data.password) {
          setError(`Password: ${data.password.join(", ")}`);
        } else if (data.password2) {
          setError(`Password confirmation: ${data.password2.join(", ")}`);
        } else if (data.phone_number) {
          setError(`Phone number: ${data.phone_number.join(", ")}`);
        } else if (data.non_field_errors) {
          setError(data.non_field_errors.join(", "));
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError("Registration failed. Please check your information.");
        }
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className=" flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4 relative">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col justify-center max-h-[600px] sm:max-h-[650px] overflow-auto">
        {/* Header */}
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Sign up to start using your account
        </p>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-center text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1">
              <input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
                pattern="^[a-zA-Z0-9_]+$"
                title="Username can only contain letters, numbers, and underscores"
                minLength="3"
                maxLength="150"
              />
              <p className="text-xs text-gray-500 px-1">
                Letters, numbers, and underscores only (3-150 characters)
              </p>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
            />
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="Phone Number (optional)"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
            />
            <div className="space-y-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
                minLength="8"
              />
              <p className="text-xs text-gray-500 px-1">
                At least 8 characters long
              </p>
            </div>
            <input
              id="password2"
              name="password2"
              type="password"
              required
              placeholder="Confirm Password"
              value={formData.password2}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition text-lg"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;
