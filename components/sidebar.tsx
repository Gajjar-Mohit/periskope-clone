"use client";

import {
  Home,
  MessageCircle,
  Zap,
  BarChart2,
  Users,
  Settings,
  FileText,
  Bell,
  Star,
  Database,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { AiFillHome } from "react-icons/ai";
import { BsChatDotsFill } from "react-icons/bs";
import { IoTicket } from "react-icons/io5";
import { FaChartLine } from "react-icons/fa6";
import { TfiMenuAlt } from "react-icons/tfi";

import { HiSpeakerphone } from "react-icons/hi";
import { IoGitBranchOutline } from "react-icons/io5";
import { RiContactsBookFill } from "react-icons/ri";

import { RiFolderImageFill } from "react-icons/ri";
import { MdChecklist } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { TbStarsFilled } from "react-icons/tb";



interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
}

export default function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClient();

  const menuItems = [
    { id: "home", icon: AiFillHome },
    { id: "chats", icon: BsChatDotsFill },
    { id: "zap", icon: IoTicket },
    { id: "analytics", icon: FaChartLine },
    { id: "contacts", icon: TfiMenuAlt },
    { id: "settings", icon: HiSpeakerphone },
    { id: "files", icon: IoGitBranchOutline },
    { id: "notifications", icon: RiContactsBookFill },
    { id: "notifications", icon: RiFolderImageFill },
    { id: "notifications", icon: MdChecklist },
    { id: "notifications", icon: IoMdSettings },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error logging out:", error.message);
        return;
      }

      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Unexpected error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-[45px] bg-white flex flex-col border-r border-gray-200">
      <div className="w-8 h-8 flex items-center justify-center mt-4 mx-auto">
        <Image src="/assets/logo.png" alt="Logo" width={60} height={60} />
      </div>
      <div className="flex-1 flex flex-col py-2 gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={cn(
                "w-full flex justify-center p-2 relative",
                activeItem === item.id && "text-green-600 bg-green-100 rounded-sm",
              )}
              onClick={() => onNavigate(item.id)}
            >
              {activeItem === item.id && (
                <div className="absolute   rounded-r-full" />
              )}
              <Icon size={20} />
            </button>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col py-2 border-t border-gray-200">
        <button className="w-full flex justify-center p-2">
          <TbStarsFilled size={20}  />
        </button>
        
        <button
          className="w-full flex justify-center p-2 mb-2 hover:text-red-500 transition-colors"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Log out"
        >
          <LogOut size={20} className={isLoggingOut ? "opacity-50" : ""} />
        </button>
        
      </div>
    </div>
  );
}
