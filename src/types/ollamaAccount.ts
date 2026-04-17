export interface OllamaAccount {
  id: string;
  email: string;
  authToken: string;
  sessionUsage?: number;
  sessionResetIn?: string;
  weeklySessionUsage?: number;
  weeklySessionResetIn?: string;
  createdAt: Date;
}

export interface OllamaAccountFormData {
  email: string;
  authToken: string;
}

// Export format - only includes necessary fields
export interface OllamaAccountExportData {
  email: string;
  authToken: string;
}

export interface OllamaAccountsExportFile {
  version: number;
  exportedAt: string;
  accounts: OllamaAccountExportData[];
}
