export type ProviderId =
  | 'google'
  | 'openai'
  | 'anthropic'
  | 'mistral'
  | 'groq'
  | 'deepseek'
  | 'perplexity'
  | 'xai'
  | 'meta'
  | 'alibaba'
  | 'cohere'
  | 'openrouter'
  | 'together'
  | 'huggingface'
  | 'custom';

export interface ModelOption {
  id: string;
  name: string;
  simpleName: string;
  provider: ProviderId;
  providerName: string;
  simpleProviderName: string;
  description: string;
  isFreeOrCheap?: boolean;
  enabled: boolean;
  contextWindow?: number;
  isCustom?: boolean;
}

export interface DiscoveredModel {
  id: string;
  name: string;
}

export interface Attachment {
  name: string;
  size: number;
  type: string;
  base64Data?: string;
  textData?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelId?: string;
  modelName?: string;
  attachments?: Attachment[];
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  errorDetails?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  modelId: string;
  encrypted?: boolean;
}

export interface CustomModelItem {
  id: string;
  name: string;
  filename?: string;
  format?: 'GGUF' | 'ONNX' | 'safetensors' | 'API/Ollama';
  endpointUrl?: string;
  enabled: boolean;
  addedAt: number;
}

export interface SecurityConfig {
  encryptFiles: boolean;
  transferProtection: boolean;
  passwordHash?: string;
  rawPasswordForSession?: string;
  boundHardwareId?: string;
  failedAttempts: number;
  lockoutUntil?: number;
}

export interface CustomizationConfig {
  useSimpleNames: boolean;
  userName: string; // "Skipped" or user's custom name
  primaryColor: string;
  primaryColorName?: string;
  accentColor: string;
  accentColorName?: string;
  fontFamily: string;
  fontName: string;
  customFontUrl?: string;
  glowOpacity?: number;
  useOldBackground?: boolean;
}

export interface ModelCustomConfig {
  customDisplayName?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface LocalPortConfig {
  enabled: boolean;
  host: string;
  port: number;
  serverType: 'ollama' | 'lmstudio' | 'vllm' | 'openai-compatible' | 'custom';
  discoveredModels: DiscoveredModel[];
}

export interface AppSettings {
  apiKeys: Record<ProviderId, string>;
  systemPrompt: string;
  autoDiscoverModels: boolean;
  maxMessagesInContext: number;
  maxSavedChats: number;
  copyModelsToAppData: boolean;
  enabledModelIds: string[];
  customModels: CustomModelItem[];
  modelConfigs: Record<string, ModelCustomConfig>;
  discoveredModels: Record<string, DiscoveredModel[]>;
  localPortConfig: LocalPortConfig;
  security: SecurityConfig;
  customization: CustomizationConfig;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'api';
  source: string;
  message: string;
  details?: any;
}
