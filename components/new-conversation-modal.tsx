"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/auth-context";
import { X, Users, User, Tag as TagIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserInterface as UserType } from "@/types";

interface NewConversationModalProps {
  open: boolean;
  onClose: () => void;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

export function NewConversationModal({
  open,
  onClose,
}: NewConversationModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchTags();
    } else {
      // Reset state when modal closes
      setSelectedUsers([]);
      setGroupName("");
      setSearchQuery("");
      setSelectedTagId("");
      setError(null);
    }
  }, [open]);

  const fetchUsers = async () => {
    if (!user) {
      console.log("No user, skipping fetch");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching users...");

      // First, ensure the current user exists in the users table
      await ensureUserExists(user.id, user.email, user.full_name);

      // Fetch all users except the current user
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .neq("id", user.id)
        .order("full_name", { ascending: true });

      if (error) throw error;

      console.log("Users fetched:", data?.length || 0);
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    setTagsLoading(true);

    try {
      console.log("Fetching tags...");
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      console.log("Tags fetched:", data?.length || 0);
      setTags(data || []);

      // Select the first tag by default if available
      if (data && data.length > 0 && !selectedTagId) {
        setSelectedTagId(data[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching tags:", error);
      setError(error.message || "Failed to load tags");
    } finally {
      setTagsLoading(false);
    }
  };

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
        .select("id")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Record not found
          console.log("User not found, creating:", userId);

          // Create the user
          const { error: insertError } = await supabase.from("users").insert({
            id: userId,
            email: email || `user-${userId}@example.com`,
            full_name: fullName || `User ${userId.substring(0, 8)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Error creating user:", insertError);
            throw insertError;
          }

          console.log("User created successfully:", userId);
        } else {
          throw error;
        }
      } else {
        console.log("User already exists:", userId);
      }
    } catch (error) {
      console.error("Error in ensureUserExists:", error);
      throw error;
    }
  };

  const handleCreateConversation = async () => {
    if (!user) {
      console.log("No user, cannot create conversation");
      return;
    }

    if (selectedUsers.length === 0) {
      setError("Please select at least one user");
      return;
    }

    if (!selectedTagId) {
      setError("Please select a tag for the conversation");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      console.log("Creating conversation...");
      console.log("Is group:", isGroup);
      console.log("Group name:", groupName);
      console.log("Selected tag ID:", selectedTagId);
      console.log(
        "Selected users:",
        selectedUsers.map((u) => u.id)
      );

      // First, ensure the current user exists in the users table
      await ensureUserExists(user.id, user.email, user.full_name);

      // Then ensure all selected users exist in the users table
      for (const selectedUser of selectedUsers) {
        await ensureUserExists(
          selectedUser.id,
          selectedUser.email,
          selectedUser.full_name
        );
      }

      // Create a new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          name: isGroup ? groupName : null,
          is_group: isGroup,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      console.log("Conversation created:", newConversation);

      // Add the selected tag to the conversation
      const { error: tagError } = await supabase
        .from("conversation_tags")
        .insert({
          conversation_id: newConversation.id,
          tag_id: selectedTagId,
        });

      if (tagError) throw tagError;

      console.log("Added tag to conversation");

      // Add the current user as a participant
      const { error: currentUserError } = await supabase
        .from("conversation_participants")
        .insert({
          conversation_id: newConversation.id,
          user_id: user.id,
        });

      if (currentUserError) throw currentUserError;

      console.log("Added current user as participant");

      // Add selected users as participants
      for (const selectedUser of selectedUsers) {
        const { error: participantError } = await supabase
          .from("conversation_participants")
          .insert({
            conversation_id: newConversation.id,
            user_id: selectedUser.id,
          });

        if (participantError) throw participantError;
      }

      console.log("Added selected users as participants");

      // Add a welcome message
      const welcomeMessage = isGroup
        ? `${user.full_name} created group "${groupName}"`
        : `${user.full_name} started a conversation`;

      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: newConversation.id,
        sender_id: user.id,
        content: welcomeMessage,
      });

      if (messageError) throw messageError;

      console.log("Added welcome message");

      // Close the modal first
      onClose();

      // Then refresh the entire page to ensure all state is updated
      window.location.href = `/chats`;
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      setError(error.message || "Failed to create conversation");
    } finally {
      setCreating(false);
    }
  };

  const handleSelectUser = (selectedUser: UserType) => {
    if (selectedUsers.some((u) => u.id === selectedUser.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== selectedUser.id));
    } else {
      setSelectedUsers([...selectedUsers, selectedUser]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getTagColor = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);
    return tag?.color || "#888888";
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="direct"
          className="w-full"
          onValueChange={(value) => setIsGroup(value === "group")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Direct Message
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Group Chat
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {/* Tag selection - Required for both direct and group chats */}
            <div className="space-y-2">
              <Label htmlFor="tag-select" className="flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Conversation Tag (Required)
              </Label>
              <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                <SelectTrigger
                  id="tag-select"
                  className={`w-full ${!selectedTagId ? "text-gray-400" : ""}`}
                >
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  {tagsLoading ? (
                    <div className="flex justify-center py-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                    </div>
                  ) : tags.length === 0 ? (
                    <SelectItem value="no-tags" disabled>
                      No tags available
                    </SelectItem>
                  ) : (
                    tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: tag.color || "#888888" }}
                          />
                          {tag.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="direct" className="mt-0 pt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search-users">Select User</Label>
                  <Input
                    id="search-users"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((selectedUser) => (
                      <Badge
                        key={selectedUser.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {selectedUser.full_name}
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(selectedUser.id)}
                          className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                          aria-label={`Remove ${selectedUser.full_name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
                    </div>
                  ) : error &&
                    !error.includes("tag") &&
                    !error.includes("Tag") ? (
                    <div className="text-center text-red-500 py-4">{error}</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      {searchQuery
                        ? "No users found matching your search"
                        : "No users available"}
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Checkbox
                          checked={selectedUsers.some((u) => u.id === user.id)}
                          onCheckedChange={() => handleSelectUser(user)}
                          aria-label={`Select ${user.full_name}`}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="group" className="mt-0 pt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group Name (Required)</Label>
                  <Input
                    id="group-name"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search-users-group">Add Members</Label>
                  <Input
                    id="search-users-group"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((selectedUser) => (
                      <Badge
                        key={selectedUser.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {selectedUser.full_name}
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(selectedUser.id)}
                          className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                          aria-label={`Remove ${selectedUser.full_name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
                    </div>
                  ) : error &&
                    !error.includes("tag") &&
                    !error.includes("Tag") ? (
                    <div className="text-center text-red-500 py-4">{error}</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      {searchQuery
                        ? "No users found matching your search"
                        : "No users available"}
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Checkbox
                          checked={selectedUsers.some((u) => u.id === user.id)}
                          onCheckedChange={() => handleSelectUser(user)}
                          aria-label={`Select ${user.full_name}`}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateConversation}
            disabled={
              creating ||
              selectedUsers.length === 0 ||
              (isGroup && !groupName) ||
              !selectedTagId
            }
            className="bg-green-600 hover:bg-green-700"
          >
            {creating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
