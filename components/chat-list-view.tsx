"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Phone,
  Loader2,
  MessageSquarePlusIcon,
  Users,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ChatView from "@/components/chat-view";
import type { Conversation, Message, UserInterface } from "@/types";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/utils/supabase/client";
import { NewConversationModal } from "./new-conversation-modal";
import { HiMiniFolderArrowDown } from "react-icons/hi2";
import { TbMessageCirclePlus } from "react-icons/tb";


export default function ChatListView() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastMessages, setLastMessages] = useState<{ [key: string]: Message }>(
    {}
  );
  // Add a state for tracking unread message counts per conversation
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
    useState(false);

  const supabase = createClient();

  const fetchConversations = async () => {
    if (!user) {
      console.log("No user found, skipping conversation fetch");
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching conversations for user:", user.id);

      // Get all conversations the user is part of
      const { data: participations, error: participationsError } =
        await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", user.id);

      if (participationsError) {
        console.error("Error fetching participations:", participationsError);
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        console.log("No conversations found");
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = participations.map((p) => p.conversation_id);

      // Get conversation details
      const { data: conversationsData, error: conversationsError } =
        await supabase
          .from("conversations")
          .select(
            `
            *,
            participants:conversation_participants(
              user:user_id(*)
            ),
            tags:conversation_tags(
              tag:tag_id(*)
            )
          `
          )
          .in("id", conversationIds)
          .order("last_message_at", { ascending: false });

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError);
        throw conversationsError;
      }

      // Process conversation data to match our type definitions
      const processedConversations = conversationsData?.map((conversation) => {
        // Extract participants
        const participants = conversation.participants?.map(
          (p: any) => p.user
        ) as UserInterface[];

        // Extract tags
        const tags = conversation.tags?.map((t: any) => t.tag);

        return {
          ...conversation,
          participants,
          tags,
        };
      });

      // Fetch last message for each conversation
      const lastMessagesObj: { [key: string]: Message } = {};
      // Object to track unread message counts
      const unreadCountsObj: { [key: string]: number } = {};

      for (const conversation of processedConversations || []) {
        // First, get the last message
        const { data: messageData, error: messageError } = await supabase
          .from("messages")
          .select("*, sender:sender_id(*)")
          .eq("conversation_id", conversation.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!messageError && messageData) {
          lastMessagesObj[conversation.id] = messageData;
          // Also store the last message in the conversation object
          conversation.last_message = messageData;
        }

        // Then, count unread messages
        const { data: unreadMessages, error: unreadError } = await supabase
          .from("messages")
          .select("id")
          .eq("conversation_id", conversation.id)
          .eq("is_read", false)
          .neq("sender_id", user.id);

        if (!unreadError && unreadMessages) {
          unreadCountsObj[conversation.id] = unreadMessages.length;
        } else {
          unreadCountsObj[conversation.id] = 0;
        }
      }

      setLastMessages(lastMessagesObj);
      setUnreadCounts(unreadCountsObj);
      setConversations(processedConversations || []);

      // Set active chat to first conversation if not already set
      if (
        !activeChat &&
        processedConversations &&
        processedConversations.length > 0
      ) {
        setActiveChat(processedConversations[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      setError(error.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    // Fix for WebSocket issue - use browser-compatible subscription
    let conversationsSubscription: any = null;
    let messagesSubscription: any = null;

    try {
      // Subscribe to changes in conversations
      conversationsSubscription = supabase
        .channel("conversations-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "conversations",
          },
          () => {
            console.log("Conversations changed, refreshing...");
            fetchConversations();
          }
        )
        .subscribe();

      // Subscribe to changes in messages
      messagesSubscription = supabase
        .channel("messages-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          () => {
            console.log("New message received, refreshing conversations...");
            fetchConversations();
          }
        )
        .subscribe();
    } catch (err) {
      console.error("Error setting up realtime subscriptions:", err);
    }

    return () => {
      // Clean up subscriptions
      try {
        if (conversationsSubscription)
          supabase.removeChannel(conversationsSubscription);
        if (messagesSubscription) supabase.removeChannel(messagesSubscription);
      } catch (err) {
        console.error("Error removing channels:", err);
      }
    };
  }, [supabase, user]);

  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name;

    // For non-group chats, use the other participant's name if available
    if (
      !conversation.is_group &&
      conversation.participants &&
      conversation.participants.length > 0
    ) {
      const otherParticipants = conversation.participants.filter(
        (p) => p.id !== user?.id
      );
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
      .toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      });
    }
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    const lastMessage = lastMessages[conversation.id];
    if (!lastMessage) return "";

    const isCurrentUser = lastMessage.sender_id === user?.id;
    const prefix = isCurrentUser
      ? "You: "
      : lastMessage.sender?.full_name
        ? `${lastMessage.sender.full_name}: `
        : "";

    return `${prefix}${lastMessage.content}`;
  };

  const getPhoneNumber = (conversation: Conversation) => {
    if (!conversation.participants) return null;

    // For non-group chats, show the other participant's phone
    if (!conversation.is_group) {
      const otherParticipants = conversation.participants.filter(
        (p) => p.id !== user?.id
      );
      if (otherParticipants.length > 0 && otherParticipants[0].phone_number) {
        return otherParticipants[0].phone_number;
      }
    }

    return null;
  };

  const filteredConversations = conversations.filter((conversation) => {
    const name = getConversationName(conversation).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-full">
      <div className="absolute bottom-6 right-[calc(100%-420px)]">
        <Button
          onClick={() => setIsNewConversationModalOpen(true)}
          className="h-12 w-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700 transition-colors"
          size="icon"
          title="New conversation"
        >
          <TbMessageCirclePlus className="h-6 w-6 text-white" />
        </Button>
      </div>
      <div className="w-[400px] border-r border-gray-200 flex flex-col bg-white">
        <div className="p-3 border-b border-gray-200 flex items-center gap-2">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <span className="flex items-center gap-1">
              <HiMiniFolderArrowDown
                className="text-green"
                height={10}
                width={10}
              />
              Custom filter
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            Save
          </Button>
          <div className="relative flex-1">
            <Search
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              className="h-7 pl-8 text-xs"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex items-center gap-1"
          >
            <Filter size={14} />
            Filtered
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const lastMessage = lastMessages[conversation.id];
              const lastMessageTime =
                lastMessage?.created_at || conversation.last_message_at;
              const unreadCount = unreadCounts[conversation.id] || 0;
              const hasUnread = unreadCount > 0;
              const phoneNumber = getPhoneNumber(conversation);

              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex gap-3",
                    activeChat === conversation.id && "bg-gray-50"
                  )}
                  onClick={() => setActiveChat(conversation.id)}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      {conversation.is_group ? (
                        <AvatarFallback className="bg-blue-200">
                          {getInitials(getConversationName(conversation))}
                        </AvatarFallback>
                      ) : conversation.participants &&
                        conversation.participants.length > 0 ? (
                        <>
                          {conversation.participants.find(
                            (p) => p.id !== user?.id
                          )?.avatar_url ? (
                            <AvatarImage
                              src={
                                conversation.participants.find(
                                  (p) => p.id !== user?.id
                                )?.avatar_url || ""
                              }
                              alt={getConversationName(conversation)}
                            />
                          ) : (
                            <AvatarFallback className="bg-gray-200">
                              {getInitials(getConversationName(conversation))}
                            </AvatarFallback>
                          )}
                        </>
                      ) : (
                        <AvatarFallback className="bg-gray-200">
                          {getConversationName(conversation).charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {getConversationName(conversation)}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {getLastMessagePreview(conversation)}
                    </div>
                    {phoneNumber && (
                      <div className="inline-flex items-center text-xs bg-gray-100 px-1.5 py-0.5 rounded-md text-gray-700 w-fit">
                        <Phone size={10} className="mr-1 text-gray-500" />
                        {phoneNumber}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[60px]">
                    <div className="flex gap-1">
                      {conversation.is_group && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 bg-blue-50 text-blue-600 font-normal"
                        >
                          Group
                        </Badge>
                      )}
                      {conversation.tags?.map((tag) => (
                        <Badge
                          key={tag.id}
                          className={cn(
                            "text-[10px] h-5 font-normal",
                            tag.color === "green" &&
                              "bg-green-50 text-green-600",
                            tag.color === "#FFA500" && "bg-red-50 text-red-600",
                            tag.color === "#00FF00" &&
                              "bg-blue-50 text-blue-600",
                            !tag.color && "bg-gray-50 text-gray-600"
                          )}
                          style={
                            tag.color && tag.color.startsWith("#")
                              ? {
                                  backgroundColor: `${tag.color}20`, // 20 is hex for 12% opacity
                                  color: tag.color,
                                }
                              : undefined
                          }
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {conversation.participants && conversation.is_group && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 bg-gray-50 text-gray-500 font-normal"
                        >
                          +{conversation.participants.length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="text-xs text-gray-500">
                        {formatTime(lastMessageTime)}
                      </div>
                      {!hasUnread && (
                        <div className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-white">
                          {conversation.is_group ? (
                            <Users size={10} fill="currentColor" />
                          ) : (
                            <User size={10} fill="currentColor" />
                          )}
                        </div>
                      )}
                      {hasUnread && (
                        <div className="w-auto min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-green-500 rounded-full text-white text-[10px] font-bold">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {activeChat && <ChatView chatId={activeChat} />}
      <NewConversationModal
        open={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
      />
    </div>
  );
}
