
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-sonner';
import { TranscriptionResult, Note } from '@/types';
import Header from '@/components/Header';
import RecordButton from '@/components/RecordButton';
import EmptyState from '@/components/EmptyState';
import NoteCard from '@/components/NoteCard';

const Index = () => {
  const navigate = useNavigate();
  const [recentNotes, setRecentNotes] = useState<Note[]>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('thought-garden-notes');
    if (!saved) return [];
    
    try {
      // Parse the saved notes and ensure dates are properly converted to Date objects
      const parsedNotes = JSON.parse(saved);
      return parsedNotes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
    } catch (error) {
      console.error("Error parsing saved notes:", error);
      return [];
    }
  });

  const handleTranscriptionComplete = (result: TranscriptionResult) => {
    // Create a new note from the transcription
    const newNote: Note = {
      id: Date.now().toString(),
      title: result.title,
      content: result.text,
      summary: result.summary,
      categories: result.categories,
      keywords: result.keywords,
      actionItems: result.actionItems,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to recent notes
    const updatedNotes = [newNote, ...recentNotes];
    setRecentNotes(updatedNotes);
    
    // Save to localStorage with proper date handling
    const notesToSave = updatedNotes.map(note => ({
      ...note,
      // Store dates as ISO strings for reliable serialization
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString()
    }));
    
    localStorage.setItem('thought-garden-notes', JSON.stringify(notesToSave));
    
    // Navigate to the new note
    navigate(`/notes/${newNote.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 pt-20 pb-32">
        <div className="flex flex-col items-center justify-center gap-8 py-10">
          <div className="text-center space-y-3 max-w-md animate-fade-in">
            <div className="inline-flex items-center justify-center gap-2 bg-accent/50 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium mb-2">
              <Sparkles size={16} />
              <span>AI-Powered Thought Capture</span>
            </div>
            <h2 className="text-3xl font-medium tracking-tight">
              Speak your mind, we'll organize the rest
            </h2>
            <p className="text-muted-foreground">
              Record your thoughts, ideas, and goals. Our AI will transcribe and organize them for you.
            </p>
          </div>
          
          <RecordButton onTranscriptionComplete={handleTranscriptionComplete} />
          
          {recentNotes.length > 0 ? (
            <div className="w-full space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Thoughts</h3>
                <button 
                  onClick={() => navigate('/notes')}
                  className="text-sm text-primary hover:underline focus-ring rounded"
                >
                  View all
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {recentNotes.slice(0, 3).map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
