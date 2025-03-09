
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BrainCircuit } from 'lucide-react';
import { toast } from '@/hooks/use-sonner';
import { TranscriptionResult, Note } from '@/types';
import Header from '@/components/Header';
import RecordButton from '@/components/RecordButton';
import EmptyState from '@/components/EmptyState';
import NoteCard from '@/components/NoteCard';
import { useAuth } from '@/lib/auth';
import { getNotes, createNote } from '@/lib/notes';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load notes from Supabase
  useEffect(() => {
    const loadNotes = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const notes = await getNotes();
          setRecentNotes(notes);
        } catch (error) {
          console.error("Error loading notes:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadNotes();
  }, [user]);

  const handleTranscriptionComplete = async (result: TranscriptionResult) => {
    console.log("Transcription complete, creating note:", result);
    
    if (!user) {
      toast.error("You must be logged in to create notes");
      navigate('/auth');
      return;
    }
    
    try {
      const newNote = await createNote(result);
      
      if (newNote) {
        // Add to recent notes and navigate to the new note
        setRecentNotes([newNote, ...recentNotes]);
        navigate(`/notes/${newNote.id}`);
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note. Please try again.");
    }
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
          
          {!user && (
            <div className="text-center mt-4">
              <p className="text-muted-foreground mb-2">Sign in to save your notes</p>
              <Button asChild>
                <a href="/auth">Sign in</a>
              </Button>
            </div>
          )}
          
          {user && (
            <div className="flex gap-4 mt-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/notes')}
              >
                View All Notes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/deep-insights')}
                className="flex items-center gap-2"
              >
                <BrainCircuit size={16} />
                <span>Deep Insights</span>
              </Button>
            </div>
          )}
          
          {user && isLoading && (
            <div className="w-full flex justify-center py-8">
              <div className="animate-pulse w-16 h-16 rounded-full bg-muted"></div>
            </div>
          )}
          
          {user && !isLoading && recentNotes.length > 0 ? (
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
          ) : user && !isLoading ? (
            <EmptyState />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Index;
