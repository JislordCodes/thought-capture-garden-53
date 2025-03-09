import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Tag } from 'lucide-react';
import { Note } from '@/types';
import Header from '@/components/Header';
import NoteCard from '@/components/NoteCard';
import EmptyState from '@/components/EmptyState';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getNotes } from '@/lib/notes';

const NotesPage = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      try {
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
        
        const categories = Array.from(
          new Set(fetchedNotes.flatMap(note => note.categories))
        );
        setAllCategories(categories);
      } catch (error) {
        console.error("Error loading notes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotes();
  }, []);
  
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === null || 
      note.categories.includes(selectedCategory);
      
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="All Notes" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse w-16 h-16 rounded-full bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        title="My Notes" 
        showMindMapButton={notes && notes.length > 1} 
      />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 pt-20 pb-10">
        <div className="space-y-6 py-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your thoughts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          
          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center pb-2">
              <span className="text-sm text-muted-foreground flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                Filter:
              </span>
              
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                  "transition-colors duration-200",
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                All
              </button>
              
              {allCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                    "transition-colors duration-200",
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  <Tag size={12} className="mr-1" />
                  {category}
                </button>
              ))}
            </div>
          )}
          
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 animate-fade-in">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No matching notes found" 
              description={searchQuery ? "Try a different search term or filter" : "Start recording to create your first note"}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default NotesPage;
