"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AuthProvider } from "@/context/auth-context";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    console.log("Protected layout mounted");

    const checkAuth = async () => {
      try {
        console.log("Checking authentication in protected layout...");
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          console.log("No session found, redirecting to login");
          window.location.href = "/sign-in";
          return;
        }

        console.log("User is authenticated in protected layout");
        setAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.error("Auth check error in protected layout:", error);
        window.location.href = "/sign-in";
      }
    };

    checkAuth();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
        <p className="ml-2">Loading authentication...</p>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <div className=" w-full h-screen">{children}</div>;
}

export default function ProtectedLayoutWithProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthProvider>
  );
}
