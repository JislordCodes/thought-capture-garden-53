
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Tag, ListChecks, KeyRound, Trash2 } from 'lucide-react';
import { Note } from '@/types';
import { toast } from '@/hooks/use-sonner';
import Header from '@/components/Header';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getNoteById, deleteNote } from '@/lib/notes';

const NoteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadNote = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const fetchedNote = await getNoteById(id);
        setNote(fetchedNote);
      } catch (error) {
        console.error("Error loading note:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNote();
  }, [id]);
  
  // Format date to be more readable
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    const success = await deleteNote(id);
    
    if (success) {
      toast.success("Note deleted successfully");
      navigate('/notes');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Loading..." showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse w-16 h-16 rounded-full bg-muted"></div>
        </div>
      </div>
    );
  }
  
  if (!note) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Note not found" showBackButton />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 p-4 text-center">
          <h2 className="text-xl font-medium">Note not found</h2>
          <p className="text-muted-foreground">
            The note you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/notes')} variant="outline">
            Back to all notes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header title={note.title} showBackButton />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 pt-20 pb-10">
        <div className="animate-fade-in space-y-6 py-6">
          <div className="flex flex-wrap gap-2 items-center">
            {note.categories.map((category, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground"
              >
                <Tag size={12} className="mr-1" />
                {category}
              </span>
            ))}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-medium leading-tight">{note.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={14} />
              <span>{formatDate(note.createdAt)}</span>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-accent/30 border border-accent">
            <h3 className="font-medium mb-2">Summary</h3>
            <p className="text-muted-foreground">{note.summary}</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <KeyRound size={16} />
              Key Insights
            </h3>
            <div className="pl-2 space-y-2">
              {note.keywords.map((keyword, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p>{keyword}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <ListChecks size={16} />
              Action Items
            </h3>
            <div className="pl-2 space-y-2">
              {note.actionItems.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-3">Full Transcription</h3>
            <div className="whitespace-pre-wrap text-muted-foreground">
              {note.content}
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 size={16} className="mr-2" />
                  Delete Note
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this note and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoteDetailPage;
