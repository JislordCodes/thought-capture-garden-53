
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';
import { Note } from '@/types';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  className?: string;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, className }) => {
  // Format date to be more readable
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <Link 
      to={`/notes/${note.id}`}
      className={cn(
        "block w-full p-5 rounded-xl shadow-sm border border-border",
        "bg-card/80 backdrop-blur-sm hover:shadow-md transition-all duration-300",
        "animate-scale-in focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {note.categories.slice(0, 3).map((category, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground"
            >
              <Tag size={12} className="mr-1" />
              {category}
            </span>
          ))}
        </div>
        
        <h3 className="text-lg font-medium leading-tight line-clamp-2">
          {note.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-3">
          {note.summary}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <Clock size={12} />
          <span>{formatDate(note.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
};

export default NoteCard;
