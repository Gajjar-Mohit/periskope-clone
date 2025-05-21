"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { UserInterface } from "@/types";

interface AuthContextType {
  user: UserInterface | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Function to ensure a user exists in the users table
  const ensureUserExists = async (
    userId: string,
    email: string,
    fullName: string
  ) => {
    try {
      console.log("Ensuring user exists:", userId);

      // Check if user exists
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Record not found
          console.log("User not found, creating:", userId);

          // Create the user
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({
              id: userId,
              email: email || `user-${userId}@example.com`,
              full_name: fullName || `User ${userId.substring(0, 8)}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) {
            console.error("Error creating user:", insertError);
            throw insertError;
          }

          console.log("User created successfully:", userId);
          return newUser;
        } else {
          throw error;
        }
      } else {
        console.log("User already exists:", userId);
        return data;
      }
    } catch (error) {
      console.error("Error in ensureUserExists:", error);
      throw error;
    }
  };

  useEffect(() => {
    console.log("Auth provider mounted");

    const fetchUser = async () => {
      try {
        console.log("Fetching user session...");
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          console.log("No session found");
          setUser(null);
          setLoading(false);
          return;
        }

        console.log("Session found, user ID:", data.session.user.id);

        try {
          // Ensure the user exists in the users table
          const userData = await ensureUserExists(
            data.session.user.id,
            data.session.user.email || "",
            data.session.user.user_metadata?.full_name || "User"
          );

          console.log("Setting user:", userData);
          setUser(userData as UserInterface);
        } catch (error) {
          console.error("Error ensuring user exists:", error);

          // Fallback to a simple user object
          const simpleUser: UserInterface = {
            id: data.session.user.id,
            email: data.session.user.email || "",
            full_name: data.session.user.user_metadata?.full_name || "User",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          console.log("Setting fallback user:", simpleUser);
          setUser(simpleUser);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error in fetchUser:", error);
        setUser(null);
        setLoading(false);
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);

      if (event === "SIGNED_OUT") {
        console.log("User signed out");
        setUser(null);
        return;
      }

      if (session) {
        console.log("Session in auth change:", session.user.id);

        // Ensure the user exists in the users table
        ensureUserExists(
          session.user.id,
          session.user.email || "",
          session.user.user_metadata?.full_name || "User"
        )
          .then((userData) => {
            setUser(userData as UserInterface);
          })
          .catch((error) => {
            console.error("Error ensuring user exists on auth change:", error);

            // Fallback to a simple user object
            const simpleUser: UserInterface = {
              id: session.user.id,
              email: session.user.email || "",
              full_name: session.user.user_metadata?.full_name || "User",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            setUser(simpleUser);
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
