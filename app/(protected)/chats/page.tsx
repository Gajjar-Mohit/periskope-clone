"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatListView from "@/components/chat-list-view";
import GettingStartedView from "@/components/getting-started-view";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/utils/supabase/client";
import { ensureUserExists } from "@/utils/supabase/user-utils";

export default function Home() {
  const [activeView, setActiveView] = useState<"chats" | "getting-started">(
    "chats"
  );
  const router = useRouter();
   const conversationId = "params.id";

   const { user } = useAuth();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const supabase = createClient();

   useEffect(() => {
     console.log("Chat detail page mounted, id:", conversationId);

     const checkAccess = async () => {
       if (!user) {
         console.log("No user, skipping check");
         return;
       }

       try {
         console.log("Ensuring user exists:", user.id);
         await ensureUserExists(user.id, user.email, user.full_name);

         // Check if user has access to this conversation
         const { data, error } = await supabase
           .from("conversation_participants")
           .select("*")
           .eq("conversation_id", conversationId)
           .eq("user_id", user.id)
           .single();

         if (error) {
           console.error("Error checking access:", error);
           setError("You don't have access to this conversation");
         }
       } catch (error: any) {
         console.error("Error in checkAccess:", error);
         setError(error.message || "Failed to load chat");
       } finally {
         setLoading(false);
       }
     };

     checkAccess();
   }, [supabase, user, conversationId]);

   if (loading) {
     return (
       <div className="flex h-screen items-center justify-center">
         <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
       </div>
     );
   }

  return (
    <div className="flex h-screen bg-[#f7f7f7]">
      <Sidebar
        activeItem={activeView === "chats" ? "chats" : "home"}
        onNavigate={(item) => {
          if (item === "home") setActiveView("getting-started");
          if (item === "chats") setActiveView("chats");
        }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === "chats" ? <ChatListView /> : <GettingStartedView />}
      </div>
      </div>
    </div>
  );
}
