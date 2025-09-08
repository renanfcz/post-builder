import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  currentPost: string | null;
  isLoading: boolean;
  error: string | null;
  hasStartedChat: boolean;
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setCurrentPost: (post: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasStartedChat: (started: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // Initial state
      messages: [],
      currentPost: null,
      isLoading: false,
      error: null,
      hasStartedChat: false,

      // Actions
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      setCurrentPost: (post) => {
        set({ currentPost: post });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      setHasStartedChat: (started) => {
        set({ hasStartedChat: started });
      },

      clearChat: () => {
        set({
          messages: [],
          currentPost: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'chat-store',
    }
  )
);