"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  HelpCircle,
  Phone,
  Bell,
  Menu,
  Maximize2,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import ChatView from "@/components/chat-view"

export default function ChatListView() {
  const [activeChat, setActiveChat] = useState<string | null>("test-el-centro")

  const chatList = [
    {
      id: "test-skope-final-5",
      name: "Test Skope Final 5",
      message: "Support2: This doesn't go on Tuesday...",
      time: "Yesterday",
      phone: "+91 99718 44008",
      phoneExt: "+1",
      type: "Demo",
      unread: true,
      avatar: null,
    },
    {
      id: "periskope-team-chat",
      name: "Periskope Team Chat",
      message: "Periskope: Test message",
      time: "28-Feb-25",
      phone: "+91 99718 44008",
      phoneExt: "+3",
      type: "Demo",
      labels: ["Internal"],
      priority: 1,
      avatar: "P",
      avatarColor: "bg-green-600",
    },
    {
      id: "swapnika",
      name: "+91 99999 99999",
      message: "Hi there, I'm Swapnika, Co-Founder of ...",
      time: "25-Feb-25",
      phone: "+91 92896 65999",
      phoneExt: "+1",
      type: "Demo",
      labels: ["Signup"],
      avatar: null,
    },
    {
      id: "test-demo17",
      name: "Test Demo17",
      message: "Rohosen: 123",
      time: "25-Feb-25",
      phone: "+91 99718 44008",
      phoneExt: "+1",
      type: "Demo",
      labels: ["Content"],
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "test-el-centro",
      name: "Test El Centro",
      message: "Roshnag: Hello, Ahmadport!",
      time: "04-Feb-25",
      phone: "+91 99718 44008",
      type: "Demo",
      avatar: null,
      active: true,
    },
    {
      id: "testing-group",
      name: "Testing group",
      message: "Testing 12345",
      time: "27-Jan-25",
      phone: "+91 92896 65999",
      type: "Demo",
      avatar: null,
    },
    {
      id: "yasin-3",
      name: "Yasin 3",
      message: "First Bulk Message",
      time: "25-Nov-24",
      phone: "+91 99718 44008",
      phoneExt: "+3",
      type: "Demo",
      labels: ["Dont Send"],
      participants: 2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "test-skope-final-9473",
      name: "Test Skope Final 9473",
      message: "Heyy",
      time: "01-Jan-25",
      phone: "+91 99718 44008",
      phoneExt: "+1",
      type: "Demo",
      muted: true,
      unread: true,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "skope-demo",
      name: "Skope Demo",
      message: "test 123",
      time: "20-Dec-24",
      phone: "+91 92896 65999",
      type: "Demo",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "test-demo15",
      name: "Test Demo15",
      message: "test 123",
      time: "20-Dec-24",
      phone: "+91 92896 65999",
      type: "Demo",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="flex h-full">
      <div className="w-[380px] border-r border-gray-200 flex flex-col bg-white">
        <div className="p-3 border-b border-gray-200 flex items-center gap-2">
          <div className="flex items-center gap-2 text-gray-600">
            <MessageSquare size={18} />
            <span className="text-sm">chats</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle size={18} />
            </Button>
            <div className="flex items-center gap-1 text-sm text-yellow-500">
              <span>5 / 6 phones</span>
              <ChevronDown size={14} />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Maximize2 size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu size={18} />
            </Button>
          </div>
        </div>
        <div className="p-3 border-b border-gray-200 flex items-center gap-2">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 flex items-center justify-center bg-green-600 text-white rounded-sm text-[10px]">
                <span>✓</span>
              </span>
              Custom filter
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            Save
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input className="h-7 pl-8 text-xs" placeholder="Search" />
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs flex items-center gap-1">
            <Filter size={14} />
            Filtered
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          {chatList.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex gap-3",
                activeChat === chat.id && "bg-gray-50",
              )}
              onClick={() => setActiveChat(chat.id)}
            >
              <div className="relative">
                <Avatar className="h-10 w-10 border border-gray-200">
                  {chat.avatar ? <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} /> : null}
                  <AvatarFallback className={chat.avatarColor || "bg-gray-200"}>
                    {chat.avatar ? "" : chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {chat.unread && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-sm truncate">{chat.name}</div>
                  <div className="text-xs text-gray-500">{chat.time}</div>
                </div>
                <div className="text-sm text-gray-600 truncate">{chat.message}</div>
                <div className="flex items-center gap-1 mt-1">
                  {chat.phone && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone size={10} className="mr-1" />
                      {chat.phone}
                      {chat.phoneExt && <span className="text-gray-400">{chat.phoneExt}</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 min-w-[60px]">
                <div className="flex gap-1">
                  {chat.type && (
                    <Badge variant="outline" className="text-[10px] h-5 bg-gray-50 text-gray-500 font-normal">
                      {chat.type}
                    </Badge>
                  )}
                  {chat.labels?.map((label) => (
                    <Badge
                      key={label}
                      variant="outline"
                      className={cn(
                        "text-[10px] h-5 font-normal",
                        label === "Internal" && "bg-green-50 text-green-600",
                        label === "Signup" && "bg-green-50 text-green-600",
                        label === "Content" && "bg-green-50 text-green-600",
                        label === "Dont Send" && "bg-red-50 text-red-600",
                      )}
                    >
                      {label}
                    </Badge>
                  ))}
                  {chat.participants && (
                    <Badge variant="outline" className="text-[10px] h-5 bg-gray-50 text-gray-500 font-normal">
                      +{chat.participants}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {chat.priority === 1 && <div className="w-4 h-4 flex items-center justify-center">1</div>}
                  {chat.muted && <div className="w-4 h-4 flex items-center justify-center">🔇</div>}
                  {chat.unread && <div className="w-4 h-4 bg-green-500 rounded-full" />}
                  {!chat.unread && <div className="w-4 h-4 flex items-center justify-center">✓</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {activeChat && <ChatView chatId={activeChat} />}
    </div>
  )
}
