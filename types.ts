export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string; // Base64 string for displayed images
  isImageGeneration?: boolean;
}

export interface ImageFile {
  data: string; // Base64
  mimeType: string;
  name: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type AIProvider = 'gemini' | 'openrouter';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export type ProjectFiles = Record<string, string>;

export interface SavedSession {
  id: string;
  title: string;
  messages: Message[];
  projectFiles: ProjectFiles;
  previewHtml: string;
  lastModified: number;
}