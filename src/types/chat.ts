// Basic chat types for simple messaging
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Basic chat functionality (no AI dependencies)
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// Placeholder for future AI integration
export interface AIFlowConfig {
  // TODO: Define new AI flow structure
  enabled: boolean;
  apiEndpoint?: string;
  model?: string;
}
