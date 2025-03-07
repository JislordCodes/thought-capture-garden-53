
export interface Note {
  id: string;
  title: string;
  content: string;
  summary: string;
  categories: string[];
  keywords: string[];
  actionItems: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecordingStatus {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  isProcessing: boolean;
}

export interface TranscriptionResult {
  text: string;
  title: string;
  summary: string;
  categories: string[];
  keywords: string[];
  actionItems: string[];
}
