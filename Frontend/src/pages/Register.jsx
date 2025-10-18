import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserNurse, FaUserTie } from "react-icons/fa";
import { BsPersonFill, BsPersonWorkspace } from "react-icons/bs";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    phone_number: "",
    location: "", // This will be the home address now
    profile_picture: null,
    selected_avatar: "",
  });
  const [profileOption, setProfileOption] = useState("avatar"); // "avatar" or "upload"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create FormData to handle file uploads
      const submitData = new FormData();
      submitData.append("username", formData.username);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("password2", formData.password2);
      submitData.append("phone_number", formData.phone_number);
      submitData.append("location", formData.location);
      submitData.append("selected_avatar", formData.selected_avatar);

      if (formData.profile_picture) {
        submitData.append("profile_picture", formData.profile_picture);
      }

      const response = await fetch(
        "http://localhost:8000/api/users/register/",
        {
          method: "POST",
          body: submitData,
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

  const handleFileChange = (e) => {
    setFormData({ ...formData, profile_picture: e.target.files[0] });
  };

  const handleAvatarSelect = (avatar) => {
    setFormData({ ...formData, selected_avatar: avatar.id });
  };

  // Avatar options - Professional icons
  const avatarOptions = [
    {
      id: "male",
      name: "Male",
      icon: FaUserTie,
      color: "text-blue-600",
    },
    {
      id: "female",
      name: "Female",
      icon: FaUserNurse,
      color: "text-pink-600",
    },
  ];

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 px-4 py-8 relative">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-2">
          Create Account
        </h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          Sign up to start using your account
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-center text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* First Row - Username and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition"
              pattern="^[a-zA-Z0-9_]+$"
              title="Username can only contain letters, numbers, and underscores"
              minLength="3"
              maxLength="150"
            />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition"
            />
          </div>

          {/* Second Row - Phone and Profile Picture Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition"
            />
            <div className="flex gap-0 relative">
              {/* Display Area - Shows what user selected */}
              <div className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg shadow-sm bg-gray-50 text-gray-600 text-sm flex items-center">
                {formData.profile_picture
                  ? `Selected: ${formData.profile_picture.name}`
                  : formData.selected_avatar
                  ? `Avatar: ${
                      avatarOptions.find(
                        (a) => a.id === formData.selected_avatar
                      )?.name
                    }`
                  : "Select profile picture option"}
              </div>

              {/* Upload Photo Square */}
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => {
                    handleFileChange(e);
                    setProfileOption("upload");
                  }}
                  className="hidden"
                  id="file-upload-direct"
                />
                <label
                  htmlFor="file-upload-direct"
                  className="w-10 h-10 border-l-0 border border-gray-300 shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </label>
              </div>

              {/* Avatar Selection Square */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setProfileOption(profileOption === "avatar" ? "" : "avatar")
                  }
                  className="w-10 h-10 border-l-0 border border-gray-300 rounded-r-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>

                {/* Avatar Dropdown */}
                {profileOption === "avatar" && (
                  <div className="absolute top-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10">
                    <div className="flex gap-2">
                      {avatarOptions.map((avatar, index) => {
                        const IconComponent = avatar.icon;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              handleAvatarSelect(avatar);
                              setProfileOption("avatar");
                            }}
                            className={`w-12 h-12 rounded-lg border-2 transition flex items-center justify-center ${
                              formData.selected_avatar === avatar.id
                                ? "border-teal-500 bg-teal-50"
                                : "border-gray-300 hover:border-gray-400 bg-white"
                            }`}
                            title={avatar.name}
                          >
                            <IconComponent
                              className={`w-6 h-6 ${
                                formData.selected_avatar === avatar.id
                                  ? "text-teal-600"
                                  : avatar.color
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Third Row - Location (Full Width) */}
          <div>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition"
            />
          </div>

          {/* Fourth Row - Password and Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition"
              minLength="8"
            />
            <input
              id="password2"
              name="password2"
              type="password"
              required
              placeholder="Confirm Password"
              value={formData.password2}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition text-lg mt-6"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-orange-500 hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;
