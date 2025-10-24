// contexts/AuthContext.jsx - Updated with simpler approach
import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(
    () => localStorage.getItem("access_token") || null
  );
  const [pendingApprovals, setPendingApprovals] = useState(0);

  const formatAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    const filename = avatarPath.split("/").pop();
    return `${import.meta.env.VITE_LARAVEL_API}/avatar/${filename}`;
  };

  // Function to fetch pending approvals count using existing endpoint
  const fetchPendingApprovalsCount = async (authToken) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/pending-users`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        // Count the users from the existing endpoint
        const count = data.users ? data.users.length : 0;
        setPendingApprovals(count);
      } else {
        setPendingApprovals(0);
      }
    } catch (error) {
      console.error("Failed to fetch pending approvals count:", error);
      setPendingApprovals(0);
    }
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
          const formattedUser = {
            ...userData.user,
            avatar: formatAvatarUrl(userData.user?.avatar),
          };

          setUser(formattedUser);
          setToken(storedToken);

          // Fetch pending approvals count if user is admin
          if (userData.user?.role === "admin") {
            await fetchPendingApprovalsCount(storedToken);
          }
        } else {
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

      const formattedUser = {
        ...data.user,
        avatar: formatAvatarUrl(data.user?.avatar),
      };

      setToken(data.access_token);
      setUser(formattedUser);

      // Fetch pending approvals count if user is admin
      if (data.user?.role === "admin") {
        await fetchPendingApprovalsCount(data.access_token);
      }

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
      setPendingApprovals(0);
    }
  };

  // Function to refresh pending approvals count
  const refreshPendingApprovals = async () => {
    if (token && user?.role === "admin") {
      await fetchPendingApprovalsCount(token);
    }
  };

const refreshUserData = async () => {
  const storedToken = localStorage.getItem("access_token");
  
  if (!storedToken) {
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
      const formattedUser = {
        ...userData.user,
        avatar: formatAvatarUrl(userData.user?.avatar),
      };

      setUser(formattedUser);

      // Fetch pending approvals count if user is admin
      if (userData.user?.role === 'admin') {
        await fetchPendingApprovalsCount(storedToken);
      }
      
      return formattedUser; // Return the updated user data
    }
  } catch (error) {
    console.error("User data refresh failed:", error);
    throw error;
  }
};
// Add refreshUserData to the context value
const value = {
  user,
  login,
  logout,
  token,
  loading,
  pendingApprovals,
  refreshPendingApprovals,
  refreshUserData, // Add this line
  isAuthenticated: !!user && !!token,
  isAdmin: user?.role === "admin",
  isBarangay: user?.role === "barangay",
  isApproved: user?.status === "approved",
  isPending: user?.status === "pending"
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
