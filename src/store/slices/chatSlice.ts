import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message | null;
  unreadCount: number;
}

interface ChatState {
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchConversationsStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchConversationsSuccess(state, action: PayloadAction<Conversation[]>) {
      state.isLoading = false;
      state.conversations = action.payload;
    },
    fetchConversationsFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCurrentConversation(state, action: PayloadAction<string>) {
      state.currentConversation = action.payload;
    },
    fetchMessagesStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchMessagesSuccess(state, action: PayloadAction<{conversationId: string, messages: Message[]}>) {
      const { conversationId, messages } = action.payload;
      state.isLoading = false;
      state.messages[conversationId] = messages;
    },
    fetchMessagesFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    sendMessageStart(state) {
      state.isLoading = true;
    },
    sendMessageSuccess(state, action: PayloadAction<{conversationId: string, message: Message}>) {
      const { conversationId, message } = action.payload;
      state.isLoading = false;
      
      // Add message to conversation
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
      
      // Update conversation last message
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = message;
      }
    },
    sendMessageFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    markAsRead(state, action: PayloadAction<{conversationId: string, messageIds: string[]}>) {
      const { conversationId, messageIds } = action.payload;
      
      if (state.messages[conversationId]) {
        state.messages[conversationId].forEach(message => {
          if (messageIds.includes(message.id)) {
            message.read = true;
          }
        });
      }
      
      // Update unread count
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
  },
});

export const { 
  fetchConversationsStart,
  fetchConversationsSuccess,
  fetchConversationsFailure,
  setCurrentConversation,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  markAsRead
} = chatSlice.actions;

export default chatSlice.reducer; 