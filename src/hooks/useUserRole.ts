import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "builder" | "sponsor" | "admin" | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (userRoles && userRoles.length > 0) {
        // Priority: admin > sponsor > builder
        if (userRoles.some(r => r.role === "admin")) {
          setRole("admin");
        } else if (userRoles.some(r => r.role === "sponsor")) {
          setRole("sponsor");
        } else {
          setRole("builder");
        }
      } else {
        setRole("builder");
      }
      
      setLoading(false);
    };

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, loading, isSponsor: role === "sponsor" || role === "admin", isAdmin: role === "admin" };
};
