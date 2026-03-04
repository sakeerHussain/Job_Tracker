import { createContext, useState, useEffect } from "react";
import { getMe, logoutUser } from "../api/authApi.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getMe();
        setUser(data.data);
      } catch {
        setUser(null); // Expected when not logged in — not an error
      } finally {
        setLoading(false); // Always stop loading regardless of result
      }
    };
    checkAuth();
  }, []); // Empty array — runs once only

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};