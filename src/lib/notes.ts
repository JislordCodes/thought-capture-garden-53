
import { supabase } from '@/integrations/supabase/client';
import { Note, TranscriptionResult } from '@/types';
import { toast } from '@/hooks/use-sonner';

export async function getNotes(): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data.map(note => ({
      ...note,
      createdAt: new Date(note.created_at),
      updatedAt: new Date(note.updated_at),
      actionItems: note.action_items || [], // Ensure actionItems are mapped from action_items
    })) as Note[];
  } catch (error) {
    console.error('Error fetching notes:', error);
    toast.error('Failed to fetch notes');
    return [];
  }
}

export async function getNoteById(id: string): Promise<Note | null> {
  try {
    console.log('Fetching note with ID:', id);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        console.log('Note not found:', id);
        return null;
      }
      throw error;
    }
    
    console.log('Note data retrieved:', data);
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      actionItems: data.action_items || [], // Ensure actionItems are mapped from action_items
    } as Note;
  } catch (error) {
    console.error('Error fetching note:', error);
    toast.error('Failed to fetch note');
    return null;
  }
}

export async function createNote(result: TranscriptionResult): Promise<Note | null> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw userError;
    }
    
    if (!userData.user) {
      toast.error('You must be logged in to create notes');
      return null;
    }
    
    const newNote = {
      title: result.title || "Untitled Note",
      content: result.text || "",
      summary: result.summary || "No summary available",
      categories: result.categories || [],
      keywords: result.keywords || [],
      action_items: result.actionItems || [],
      user_id: userData.user.id
    };
    
    const { data, error } = await supabase
      .from('notes')
      .insert(newNote)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      actionItems: data.action_items || [], // Ensure actionItems are mapped from action_items
    } as Note;
  } catch (error) {
    console.error('Error creating note:', error);
    toast.error('Failed to create note');
    return null;
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    toast.error('Failed to delete note');
    return false;
  }
}
