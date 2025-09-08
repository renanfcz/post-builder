export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  setError: (error: string | null) => void;
}