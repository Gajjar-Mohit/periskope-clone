export interface UserInterface {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  name?: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  participants?: UserInterface[];
  last_message?: Message;
  tags?: Tag[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: UserInterface;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
}

export interface ConversationTag {
  id: string;
  conversation_id: string;
  tag_id: string;
}
