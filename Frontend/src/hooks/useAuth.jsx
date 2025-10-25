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
    const loadProfile = async () => {
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8000/api/users/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          return;
        }

        // If unauthorized, try to refresh the token and retry once
        if (res.status === 401 || res.status === 403) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const newToken = localStorage.getItem("token");
            const res2 = await fetch(
              "http://localhost:8000/api/users/profile/",
              {
                headers: { Authorization: `Bearer ${newToken}` },
              }
            );
            if (res2.ok) {
              const data2 = await res2.json();
              setUser(data2);
              return;
            }
          }
          // Refresh failed or second call failed, log out
          logout();
        }
      } catch (e) {
        console.error("Profile load error:", e);
      }
    };

    loadProfile();
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
