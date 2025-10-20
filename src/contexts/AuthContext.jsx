// contexts/AuthContext.jsx - Fixed version
import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(
    () => localStorage.getItem("access_token") || null
  );

  // In AuthContext.jsx, update the formatAvatarUrl function:
  const formatAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;

    // Extract just the filename from the path
    const filename = avatarPath.split("/").pop();

    // Use the API avatar endpoint
    return `${import.meta.env.VITE_LARAVEL_API}/avatar/${filename}`;
  };

  // Check authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("access_token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_LARAVEL_API}/user`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const userData = await res.json();
          console.log("User data from API:", userData);
          console.log("Avatar URL:", userData.user?.avatar);

          // Format the user data with proper avatar URL
          const formattedUser = {
            ...userData.user,
            avatar: formatAvatarUrl(userData.user?.avatar),
          };

          console.log("Formatted avatar URL:", formattedUser.avatar);

          setUser(formattedUser);
          setToken(storedToken);
        } else {
          console.log("Token invalid - clearing auth");
          if (res.status === 401) {
            setUser(null);
            setToken(null);
            localStorage.removeItem("access_token");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_LARAVEL_API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);

      // Format user data with proper avatar URL
      const formattedUser = {
        ...data.user,
        avatar: formatAvatarUrl(data.user?.avatar),
      };

      setToken(data.access_token);
      setUser(formattedUser);

      return {
        success: true,
        user: formattedUser,
        warning: data.warning,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${import.meta.env.VITE_LARAVEL_API}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("access_token");
      setUser(null);
      setToken(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "admin",
    isBarangay: user?.role === "barangay",
    isApproved: user?.is_approved === true,
    isPending: user?.role === "barangay" && user?.is_approved === false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
