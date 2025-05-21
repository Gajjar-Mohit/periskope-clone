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
  Phone,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { Conversation, Message, UserInterface } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import bgImage from "/public/assets/bg.png";
import { BsStars } from "react-icons/bs";


interface ChatViewProps {
  chatId: string;
}

export default function ChatView({ chatId }: ChatViewProps) {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<UserInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabaseClient = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversationDetails = async () => {
    try {
      setLoading(true);
      const { data: conversationData, error: conversationError } =
        await supabaseClient
          .from("conversations")
          .select("*")
          .eq("id", chatId)
          .single();

      if (conversationError) {
        throw conversationError;
      }

      setConversation(conversationData);

      const { data: participantsData, error: participantsError } =
        await supabaseClient
          .from("conversation_participants")
          .select("user:user_id(*)")
          .eq("conversation_id", chatId);

      if (participantsError) {
        throw participantsError;
      }

      const extractedParticipants = participantsData.map(
        (p) => p.user as unknown as UserInterface
      );
      setParticipants(extractedParticipants);

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
      const { data: messagesData, error: messagesError } = await supabaseClient
        .from("messages")
        .select("*, sender:sender_id(*)")
        .eq("conversation_id", chatId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        throw messagesError;
      }

      setMessages(messagesData || []);

      if (user && messagesData) {
        const unreadMessages = messagesData.filter(
          (msg) => !msg.is_read && msg.sender_id !== user.id
        );

        if (unreadMessages.length > 0) {
          const unreadIds = unreadMessages.map((msg) => msg.id);
          await supabaseClient
            .from("messages")
            .update({ is_read: true })
            .in("id", unreadIds);
        }
      }

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
      const newMessageContent = message.trim();
      setMessage("");

      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        id: tempId,
        conversation_id: chatId,
        sender_id: user.id,
        content: newMessageContent,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: user,
      };

      setMessages((prev) => [...prev, tempMessage]);

      setTimeout(scrollToBottom, 50);

      console.log("Sending message to database:", newMessageContent);

      const { data, error } = await supabaseClient
        .from("messages")
        .insert({
          conversation_id: chatId,
          sender_id: user.id,
          content: newMessageContent,
          is_read: false,
        })
        .select();

      if (error) throw error;

      console.log("Message sent successfully, response:", data);

      await supabaseClient
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", chatId);
    } catch (error: any) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let subscription: RealtimeChannel;

    async function setupRealtime() {
      if (!chatId) return;

      await fetchConversationDetails();

      console.log("Setting up realtime subscription for chat:", chatId);

      subscription = supabaseClient
        .channel(`messages-channel-${chatId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${chatId}`,
          },
          async (payload) => {
            console.log("New message received via subscription:", payload);

            try {
              const { data, error } = await supabaseClient
                .from("messages")
                .select("*, sender:sender_id(*)")
                .eq("id", payload.new.id)
                .single();

              if (error) throw error;

              console.log("Fetched complete message data:", data);

              setMessages((prevMessages) => {
                const filteredMessages = prevMessages.filter(
                  (msg) =>
                    !(
                      msg.id.toString().startsWith("temp-") &&
                      msg.content === payload.new.content &&
                      msg.sender_id === payload.new.sender_id
                    )
                );

                return [...filteredMessages, data];
              });

              if (user && data.sender_id !== user.id) {
                await supabaseClient
                  .from("messages")
                  .update({ is_read: true })
                  .eq("id", data.id);
              }

              setTimeout(scrollToBottom, 50);
            } catch (err) {
              console.error("Error processing new message:", err);
            }
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });
    }

    setupRealtime();

    return () => {
      console.log("Cleaning up subscription");
      if (subscription) {
        supabaseClient.removeChannel(subscription);
      }
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Updated getMessageDate to use ISO date string
  const getMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.error("Invalid timestamp:", timestamp);
      return "Invalid Date";
    }
    return date.toISOString().split("T")[0];
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
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting message time:", error);
      return "";
    }
  };

  const formatDateSeparator = (dateStr: string) => {
    try {
      const messageDate = new Date(dateStr);
      console.log("Parsed date:", messageDate);
      console.log("Date string:", dateStr);

      if (isNaN(messageDate.getTime())) {
        console.error("Invalid date for separator:", dateStr);
        return "Unknown Date";
      }

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const messageDateStr = messageDate.toISOString().split("T")[0];
      const todayStr = today.toISOString().split("T")[0];
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (messageDateStr === todayStr) {
        return "Today";
      } else if (messageDateStr === yesterdayStr) {
        return "Yesterday";
      } else {
        return messageDate.toLocaleDateString(undefined, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    } catch (error) {
      console.error("Error formatting date separator:", error);
      return "Unknown Date";
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
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
          <div className="flex items-center">
            {participants.slice(0, 3).map((participant, index) => (
              <Avatar
                key={participant.id}
                className={cn("h-6 w-6", index > 0 && "-ml-2")}
              >
                {participant.avatar_url ? (
                  <AvatarImage
                    src={participant.avatar_url || "/placeholder.svg"}
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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <BsStars size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-auto mx-auto space-y-5">
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
                  const isOpponent = !isFromCurrentUser;

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
                          "max-w-[70%] rounded-lg p-2 px-3 drop-shadow-md",
                          isFromCurrentUser ? "bg-[#d9fdd3]" : "bg-white"
                        )}
                      >
                        {!isFromCurrentUser && msg.sender && (
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium text-green-600">
                              {msg.sender.full_name ||
                                msg.sender.email ||
                                "Unknown User"}
                            </div>
                            {msg.sender?.phone_number && (
                              <div className="text-xs  px-1.5 py-0.5 rounded-md text-gray-700 flex items-center">
                                {msg.sender.phone_number}
                              </div>
                            )}
                          </div>
                        )}

                        {isFromCurrentUser && (
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-bold text-sm text-green-800">
                              Periskope
                            </div>
                            {msg.sender?.phone_number && (
                              <div className="text-xs  px-1.5 py-0.5 rounded-md text-gray-700 flex items-center ml-auto">
                                {msg.sender.phone_number}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-sm">{msg.content}</div>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {msg.sender?.email && isFromCurrentUser && (
                            <div className="flex items-center gap-1">
                              <span className="mr-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-500"
                                >
                                  <path d="m22 2-7 20-4-9-9-4Z"></path>
                                  <path d="M22 2 11 13"></path>
                                </svg>
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {msg.sender.email}
                              </span>
                            </div>
                          )}
                          <span className="text-[10px] text-gray-500 ml-4">
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
