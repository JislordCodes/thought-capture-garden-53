
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNotes } from '@/lib/notes';
import { generateAdvice, shouldShowAdvice } from '@/lib/advice';
import { toast } from '@/hooks/use-sonner';
import { Sparkles } from 'lucide-react';

export function useAdvice() {
  const { data: notes } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });
  
  useEffect(() => {
    // Only show advice if we have notes and shouldShowAdvice returns true
    if (notes && notes.length > 0 && shouldShowAdvice()) {
      const advice = generateAdvice(notes);
      
      // Show advice as a toast notification
      setTimeout(() => {
        toast.message("Today's Thought Advice", {
          description: advice,
          duration: 8000,
          icon: <Sparkles className="h-5 w-5 text-primary" />,
        });
      }, 1500); // Small delay to not show immediately on page load
    }
  }, [notes]);
}
