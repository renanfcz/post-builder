export interface WebhookRequest {
  message: string;
  conversation_id?: string;
}

export interface WebhookResponse {
  output: string;
}

export interface ProcessedWebhookResponse {
  response: string;
  post_content?: string;
  is_final_post?: boolean;
  suggestions?: string[];
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

export interface WebhookConfig {
  url: string;
  timeout?: number;
  retries?: number;
}
