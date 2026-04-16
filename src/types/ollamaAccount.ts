export interface OllamaAccount {
  id: string;
  email: string;
  authToken: string;
  sessionUsage?: number;
  sessionResetIn?: string;
  weeklySessionUsage?: number;
  weeklySessionResetIn?: string;
  connected?: boolean;
  createdAt: Date;
}

export interface OllamaAccountFormData {
  email: string;
  authToken: string;
}
