export interface WebhookRequest {
  message: string;
  conversation_id?: string;
}

export interface WebhookCompleteRequest {
  conversation_id: string;
  status: 'completed' | 'error' | 'failed';
  result?: {
    response?: string;
    output?: string;
    post_content?: string;
    is_final_post?: boolean;
    suggestions?: string[];
  };
  error?: string;
  message?: string;
}

export interface ProcessedWebhookResponse {
  response: string;
  post_content?: string;
  is_final_post?: boolean;
  suggestions?: string[];
  status: 'processing' | 'completed' | 'error';
  error?: string;
  conversation_id?: string;
}

export interface WebhookConfig {
  url: string;
  timeout?: number;
  retries?: number;
}
