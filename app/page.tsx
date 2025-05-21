"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ChatListView from "@/components/chat-list-view";
import GettingStartedView from "@/components/getting-started-view";
import Sidebar from "@/components/sidebar";

export default function Home() {
  const [activeView, setActiveView] = useState<"chats" | "getting-started">(
    "chats"
  );
  const router = useRouter();

  return (
    <div className="">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeItem={activeView === "chats" ? "chats" : "home"}
          onNavigate={(item) => {
            if (item === "home") setActiveView("getting-started");
            if (item === "chats") setActiveView("chats");
          }}
        />
       
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeView === "chats" ? <ChatListView /> : <GettingStartedView />}
        </div>
      </div>
    </div>
  );
}
