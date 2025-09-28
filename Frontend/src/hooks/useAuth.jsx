import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      console.log("Sending login request with:", { email, password });
      const response = await fetch("http://localhost:8000/api/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        const errorMessage = data.error || data.detail || "Login failed";
        throw new Error(errorMessage);
      }

      localStorage.setItem("token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      setToken(data.access);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) return false;

      const response = await fetch(
        "http://localhost:8000/api/users/token/refresh/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh }),
        }
      );

      if (!response.ok) throw new Error("Token refresh failed");

      const data = await response.json();
      localStorage.setItem("token", data.access);
      setToken(data.access);
      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
      return false;
    }
  };

  useEffect(() => {
    if (token) {
      fetch("http://localhost:8000/api/users/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => {
          refreshToken();
        });
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
