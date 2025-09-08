export interface LinkedInPost {
  content: string;
  hashtags: string[];
  tone: 'professional' | 'casual' | 'inspirational' | 'educational';
  target_audience: string;
  call_to_action?: string;
  length: 'short' | 'medium' | 'long';
}

export interface PostGenerationRequest {
  objective: string;
  target_audience: string;
  tone: string;
  additional_context?: string;
  conversation_history: string[];
}

export interface PostGenerationResponse {
  post: LinkedInPost;
  suggestions?: string[];
  success: boolean;
  error?: string;
}