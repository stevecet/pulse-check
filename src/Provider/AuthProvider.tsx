import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { AuthContext } from "../context/AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUser = async (sessionUser) => {
      if (sessionUser) {
        setUser(sessionUser);
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", sessionUser.id)
          .single();
        setRole(data?.role || "viewer");
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };
    // Check for existing session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUser(session?.user ?? null);
    });

    // Listen for sign-in / sign-out
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role, loading, isAdmin: role === "admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
};
