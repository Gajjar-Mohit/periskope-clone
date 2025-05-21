"use client";

import { useEffect, useState, useRef } from "react";
import {
  Search,
  Users,
  Paperclip,
  Smile,
  Mic,
  Send,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Conversation, Message, User } from "@/types";

interface ChatViewProps {
  chatId: string;
}

export default function ChatView({ chatId }: ChatViewProps) {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversationDetails = async () => {
    try {
      setLoading(true);
      // Fetch conversation details
      const { data: conversationData, error: conversationError } =
        await supabase
          .from("conversations")
          .select("*")
          .eq("id", chatId)
          .single();

      if (conversationError) {
        throw conversationError;
      }

      setConversation(conversationData);

      // Fetch participants
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("conversation_participants")
          .select("user:user_id(*)")
          .eq("conversation_id", chatId);

      if (participantsError) {
        throw participantsError;
      }

      const extractedParticipants = participantsData.map(
        (p) => p.user as unknown as User
      );
      setParticipants(extractedParticipants);

      // Fetch messages
      await fetchMessages();
    } catch (error: any) {
      console.error("Error fetching conversation details:", error);
      setError(error.message || "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*, sender:sender_id(*)")
        .eq("conversation_id", chatId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        throw messagesError;
      }

      setMessages(messagesData || []);

      // Mark unread messages as read
      if (user && messagesData) {
        const unreadMessages = messagesData.filter(
          (msg) => !msg.is_read && msg.sender_id !== user.id
        );

        if (unreadMessages.length > 0) {
          const unreadIds = unreadMessages.map((msg) => msg.id);
          await supabase
            .from("messages")
            .update({ is_read: true })
            .in("id", unreadIds);
        }
      }

      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !user) return;

    try {
      const newMessage = {
        conversation_id: chatId,
        sender_id: user.id,
        content: message.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("messages").insert(newMessage);

      if (error) throw error;

      // Also update the conversation's last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", chatId);

      setMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatId) {
      fetchConversationDetails();

      // Subscribe to new messages
      try {
        const subscription = supabase
          .channel(`messages-${chatId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `conversation_id=eq.${chatId}`,
            },
            () => {
              fetchMessages();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(subscription);
        };
      } catch (err) {
        console.error("Error setting up message subscription:", err);
      }
    }
  }, [chatId, supabase, user]);

  // Group messages by date for date separators
  const getMessageDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const groupedMessages: { [date: string]: Message[] } = {};
  messages.forEach((msg) => {
    const date = getMessageDate(msg.created_at);
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(msg);
  });

  const getConversationName = () => {
    if (!conversation) return "Loading...";
    if (conversation.name) return conversation.name;

    // For non-group chats, use the other participant's name
    if (!conversation.is_group && participants.length > 0) {
      const otherParticipants = participants.filter((p) => p.id !== user?.id);
      if (otherParticipants.length > 0) {
        return (
          otherParticipants[0].full_name ||
          otherParticipants[0].phone_number ||
          "Unknown User"
        );
      }
    }

    return "Unnamed Conversation";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 1);
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateSeparator = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5]">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        <p className="text-gray-500 mt-2">Loading conversation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f0f2f5] overflow-hidden">
      {/* Header */}
      <div className="bg-white p-3 border-b border-gray-200 flex items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {conversation?.is_group ? (
              <AvatarFallback className="bg-blue-200">
                {getConversationName().charAt(0)}
              </AvatarFallback>
            ) : participants.find((p) => p.id !== user?.id)?.avatar_url ? (
              <AvatarImage
                src={
                  participants.find((p) => p.id !== user?.id)?.avatar_url || ""
                }
                alt={getConversationName()}
              />
            ) : (
              <AvatarFallback className="bg-gray-200">
                {getConversationName().charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-medium text-sm">{getConversationName()}</div>
            <div className="text-xs text-gray-500 truncate max-w-[300px]">
              {participants
                .map((p) => p.full_name || p.phone_number || p.email)
                .join(", ")}
            </div>
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
            {participants.slice(0, 3).map((participant, index) => (
              <Avatar
                key={participant.id}
                className={cn("h-6 w-6", index > 0 && "-ml-2")}
              >
                {participant.avatar_url ? (
                  <AvatarImage
                    src={participant.avatar_url}
                    alt={participant.full_name || ""}
                  />
                ) : (
                  <AvatarFallback
                    className={cn(
                      "text-xs",
                      index % 3 === 0
                        ? "bg-gray-200"
                        : index % 3 === 1
                          ? "bg-blue-200"
                          : "bg-green-200"
                    )}
                  >
                    {getInitials(
                      participant.full_name || participant.email || "U"
                    )}
                  </AvatarFallback>
                )}
              </Avatar>
            ))}
            {participants.length > 3 && (
              <div className="h-6 w-6 -ml-2 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                +{participants.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-7xl mx-auto space-y-5">
          {Object.entries(groupedMessages).map(
            ([date, dateMessages], dateIndex) => (
              <div key={date} className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-white px-3 py-1 rounded-md text-xs text-gray-500">
                    {formatDateSeparator(date)}
                  </div>
                </div>

                {dateMessages.map((msg, msgIndex) => {
                  const isFromCurrentUser = msg.sender_id === user?.id;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        isFromCurrentUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-2 px-3",
                          isFromCurrentUser ? "bg-[#d9fdd3]" : "bg-white"
                        )}
                      >
                        {!isFromCurrentUser && msg.sender && (
                          <div className="text-sm font-medium text-green-600">
                            {msg.sender.full_name ||
                              msg.sender.phone_number ||
                              msg.sender.email}
                          </div>
                        )}
                        <div className="text-sm">{msg.content}</div>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {msg.sender?.email && isFromCurrentUser && (
                            <span className="text-[10px] text-gray-500">
                              ✓ {msg.sender.email}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500">
                            {formatMessageTime(msg.created_at)}
                          </span>
                          {isFromCurrentUser && (
                            <span
                              className={cn(
                                msg.is_read ? "text-blue-500" : "text-gray-400"
                              )}
                            >
                              <LiaCheckDoubleSolid
                                className="font-bold"
                                strokeWidth={1}
                              />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-[#f0f2f5] rounded-lg px-3 py-2">
            <Smile size={20} className="text-gray-500" />
            <Input
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-0 placeholder:text-gray-500"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Paperclip size={20} className="text-gray-500" />
            <Mic size={20} className="text-gray-500" />
          </div>
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700"
            onClick={sendMessage}
            disabled={!message.trim()}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
