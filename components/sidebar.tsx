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
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
}

export default function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: "home", icon: Home },
    { id: "chats", icon: MessageCircle },
    { id: "zap", icon: Zap },
    { id: "analytics", icon: BarChart2 },
    { id: "contacts", icon: Users },
    { id: "settings", icon: Settings },
    { id: "files", icon: FileText },
    { id: "notifications", icon: Bell },
  ];

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
                activeItem === item.id && "text-green-600"
              )}
              onClick={() => onNavigate(item.id)}
            >
              {activeItem === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-green-600 rounded-r-full" />
              )}
              <Icon size={20} />
            </button>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col py-2 border-t border-gray-200">
        <button className="w-full flex justify-center p-2">
          <Star size={20} className="text-yellow-400" />
        </button>
        <button className="w-full flex justify-center p-2">
          <Database size={20} />
        </button>
        <button className="w-full flex justify-center p-2 mb-2">
          <LogOut size={20} />
        </button>
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
            P
          </div>
        </div>
      </div>
    </div>
  );
}
