"use client"

import { useState } from "react"
import { Search, Users, Paperclip, Smile, Mic, Send } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ChatViewProps {
  chatId: string
}

export default function ChatView({ chatId }: ChatViewProps) {
  const [message, setMessage] = useState("")

  // Mock data for the active chat
  const chatData = {
    id: "test-el-centro",
    name: "Test El Centro",
    participants: ["Roshnag Airtel", "Roshnag Jio", "Bharat Kumar Ramesh", "Periskope"],
    messages: [
      {
        id: "1",
        sender: "Roshnag Airtel",
        phone: "+91 63646 47925",
        content: "CVFER",
        time: "11:51",
        status: "sent",
      },
      {
        id: "2",
        sender: "Roshnag Airtel",
        phone: "+91 63646 47925",
        content: "CDERT",
        time: "11:54",
        status: "sent",
      },
      {
        id: "3",
        sender: "Periskope",
        phone: "+91 99718 44008",
        content: "hello",
        time: "12:07",
        status: "read",
      },
      {
        id: "4",
        sender: "Roshnag Airtel",
        phone: "+91 63646 47925",
        content: "Hello, South Euna!",
        time: "08:01",
        date: "22-01-2025",
        status: "sent",
      },
      {
        id: "5",
        sender: "System",
        content: "23-01-2025",
        type: "date",
      },
      {
        id: "6",
        content: "Hello, Livonia!",
        time: "08:01",
        status: "sent",
      },
      {
        id: "7",
        sender: "Periskope",
        phone: "+91 99718 44008",
        content: "test el centro",
        time: "09:49",
        status: "read",
        metadata: "bharat@hashbabs.dev",
      },
      {
        id: "8",
        sender: "Roshnag Airtel",
        phone: "+91 63646 47925",
        content: "CDERT",
        time: "09:49",
        status: "sent",
      },
      {
        id: "9",
        sender: "Periskope",
        phone: "+91 99718 44008",
        content: "testing",
        time: "09:49",
        status: "read",
        metadata: "bharat@hashbabs.dev",
      },
    ],
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5]">
      <div className="bg-white p-3 border-b border-gray-200 flex items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-200">T</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{chatData.name}</div>
            <div className="text-xs text-gray-500 truncate max-w-[300px]">{chatData.participants.join(", ")}</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Users size={18} />
          </Button>
          <div className="flex items-center">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-gray-200 text-xs">R</AvatarFallback>
            </Avatar>
            <Avatar className="h-6 w-6 -ml-2">
              <AvatarFallback className="bg-blue-200 text-xs">B</AvatarFallback>
            </Avatar>
            <Avatar className="h-6 w-6 -ml-2">
              <AvatarFallback className="bg-green-200 text-xs">P</AvatarFallback>
            </Avatar>
            <div className="h-6 w-6 -ml-2 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">
              +3
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {chatData.messages.map((msg) => {
            if (msg.type === "date") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-white px-3 py-1 rounded-md text-xs text-gray-500">{msg.content}</div>
                </div>
              )
            }

            const isPeriskope = msg.sender === "Periskope"

            return (
              <div key={msg.id} className={cn("flex", isPeriskope ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[70%] rounded-lg p-2 px-3", isPeriskope ? "bg-[#d9fdd3]" : "bg-white")}>
                  {msg.sender && !isPeriskope && <div className="text-sm font-medium text-green-600">{msg.sender}</div>}
                  {msg.sender && isPeriskope && (
                    <div className="text-sm font-medium text-green-600 text-right">{msg.sender}</div>
                  )}
                  <div className="text-sm">{msg.content}</div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    {msg.metadata && <span className="text-[10px] text-gray-500">✓ {msg.metadata}</span>}
                    <span className="text-[10px] text-gray-500">{msg.time}</span>
                    {isPeriskope && msg.status === "read" && <span className="text-[10px] text-blue-500">✓✓</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-[#f0f2f5] rounded-lg px-3 py-2">
            <Smile size={20} className="text-gray-500" />
            <Input
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-0 placeholder:text-gray-500"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Paperclip size={20} className="text-gray-500" />
            <Mic size={20} className="text-gray-500" />
          </div>
          <Button size="icon" className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}
