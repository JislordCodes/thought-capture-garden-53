
import React from 'react';
import { BookText } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No thoughts captured yet",
  description = "Tap the microphone button to start recording your thoughts."
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
        <BookText className="h-8 w-8 text-accent-foreground" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
