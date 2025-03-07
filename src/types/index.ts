
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
  user_id?: string;
  // Database column names (not used in the UI but needed for type conversion)
  created_at?: string;
  updated_at?: string;
  action_items?: string[];
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

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

export interface NoteInsight {
  id: string;
  title: string;
  description: string;
  relatedNotes: {
    noteId: string;
    noteTitle: string;
    relevance: number;
  }[];
  type: 'theme' | 'connection' | 'trend' | 'actionRequired';
  createdAt: Date;
}
