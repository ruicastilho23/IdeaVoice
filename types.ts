export interface NoteData {
  id: string;
  createdAt: number;
  audioBlob: Blob;
  duration: number; // in seconds
  
  // AI Generated Content
  title: string;
  transcription: string;
  summary: string;
  keyPoints: string[];
  tags: string[];
  actionItems: string[];
  
  // Status
  isProcessing: boolean;
  error?: string;
}

export interface NoteMetadata {
  id: string;
  createdAt: number;
  duration: number;
  title: string;
  summary: string;
  tags: string[];
  isProcessing: boolean;
}

export interface ProcessingResult {
  title: string;
  transcription: string;
  summary: string;
  keyPoints: string[];
  tags: string[];
  actionItems: string[];
}
