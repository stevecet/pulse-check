import { useEffect, useState, useCallback } from "react";
import { supabaseApi } from "../services/supabase";
import { AuthContext } from "../context/AuthContext";
import { authService } from "../services/authService";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data } = await supabaseApi.get(`/rest/v1/profiles?id=eq.${userId}&select=role`, {
        headers: {
          Accept: "application/vnd.pgrst.object+json",
        },
      });
      return data?.role || "viewer";
    } catch (error) {
      console.error("Error fetching role:", error);
      return "viewer";
    }
  };

  const loadUser = useCallback(async () => {
    setLoading(true);
    const session = authService.getSession();
    if (session?.user) {
      setUser(session.user);
      const userRole = await fetchUserRole(session.user.id);
      setRole(userRole);
    } else {
      setUser(null);
      setRole(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAdmin: role === "admin",
        refreshAuth: loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
