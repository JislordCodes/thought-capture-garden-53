
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Tag, ListChecks, KeyRound, Trash2, CheckSquare, Square, Plus, Save, X, Edit, Check } from 'lucide-react';
import { Note } from '@/types';
import { toast } from '@/hooks/use-sonner';
import Header from '@/components/Header';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { getNoteById, deleteNote, updateNote } from '@/lib/notes';

const NoteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingActionItems, setEditingActionItems] = useState(false);
  const [newActionItem, setNewActionItem] = useState('');
  const [actionItems, setActionItems] = useState<{text: string; checked: boolean}[]>([]);
  
  useEffect(() => {
    const loadNote = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Loading note with ID:', id);
        const fetchedNote = await getNoteById(id);
        console.log('Fetched note:', fetchedNote);
        setNote(fetchedNote);
        
        // Initialize action items with checked status
        if (fetchedNote && Array.isArray(fetchedNote.actionItems)) {
          const items = fetchedNote.actionItems.map(item => {
            // Check if item is in format "✓ Task text" or "Task text"
            const isCompleted = item.startsWith('✓ ');
            const text = isCompleted ? item.substring(2) : item;
            return { text, checked: isCompleted };
          });
          setActionItems(items);
        }
      } catch (error) {
        console.error("Error loading note:", error);
        toast.error("Failed to load note");
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

  const toggleActionItemCheck = async (index: number) => {
    if (!note || !id) return;
    
    const updatedItems = [...actionItems];
    updatedItems[index].checked = !updatedItems[index].checked;
    setActionItems(updatedItems);
    
    // Save to database
    await saveActionItems(updatedItems);
  };
  
  const saveActionItems = async (items: {text: string; checked: boolean}[]) => {
    if (!note || !id) return;
    
    // Convert to format for saving: checked items start with "✓ "
    const formattedItems = items.map(item => 
      item.checked ? `✓ ${item.text}` : item.text
    );
    
    try {
      const updatedNote = await updateNote(id, {
        ...note,
        actionItems: formattedItems
      });
      
      if (updatedNote) {
        setNote(updatedNote);
        toast.success("Action items updated");
      }
    } catch (error) {
      console.error("Error updating action items:", error);
      toast.error("Failed to update action items");
    }
  };
  
  const handleAddActionItem = () => {
    if (!newActionItem.trim()) return;
    
    const updatedItems = [...actionItems, { text: newActionItem.trim(), checked: false }];
    setActionItems(updatedItems);
    setNewActionItem('');
    
    // Save to database
    saveActionItems(updatedItems);
  };
  
  const handleRemoveActionItem = (index: number) => {
    const updatedItems = actionItems.filter((_, i) => i !== index);
    setActionItems(updatedItems);
    
    // Save to database
    saveActionItems(updatedItems);
  };
  
  const toggleEditMode = () => {
    setEditingActionItems(!editingActionItems);
    
    // If we're exiting edit mode, save the items
    if (editingActionItems) {
      saveActionItems(actionItems);
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
            {note.categories && note.categories.map((category, index) => (
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
              {note.keywords && note.keywords.map((keyword, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p>{keyword}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <ListChecks size={16} />
                Action Items
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleEditMode}
              >
                {editingActionItems ? (
                  <><Save size={14} className="mr-1" /> Save</>
                ) : (
                  <><Edit size={14} className="mr-1" /> Edit</>
                )}
              </Button>
            </div>
            
            <div className="pl-2 space-y-3">
              {actionItems.length === 0 ? (
                <p className="text-muted-foreground italic">No action items</p>
              ) : (
                actionItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 group">
                    <button 
                      type="button"
                      onClick={() => toggleActionItemCheck(index)}
                      className="mt-0.5 text-foreground hover:text-primary transition-colors"
                      aria-label={item.checked ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {item.checked ? (
                        <CheckSquare size={18} className="text-primary" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                    <p className={item.checked ? "line-through text-muted-foreground" : ""}>
                      {item.text}
                    </p>
                    {editingActionItems && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                        onClick={() => handleRemoveActionItem(index)}
                      >
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                ))
              )}

              {editingActionItems && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-[18px]"></div>
                  <Input
                    placeholder="Add new action item..."
                    value={newActionItem}
                    onChange={(e) => setNewActionItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddActionItem();
                      }
                    }}
                    className="flex-1 h-8 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8"
                    onClick={handleAddActionItem}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              )}
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
