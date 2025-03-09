
import { Note } from '@/types';

// Get categories from notes to make advice more intelligent
const getTopCategories = (notes: Note[]): string[] => {
  if (!notes || notes.length === 0) return [];
  
  const categories = notes.flatMap(note => note.categories);
  const categoryCount: Record<string, number> = {};
  
  categories.forEach(category => {
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });
  
  return Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);
};

// Get action item stats
const getActionItemStats = (notes: Note[]) => {
  if (!notes || notes.length === 0) return { total: 0, completed: 0, percentage: 0 };
  
  let total = 0;
  let completed = 0;
  
  notes.forEach(note => {
    if (note.actionItems && note.actionItems.length > 0) {
      note.actionItems.forEach(item => {
        total++;
        if (item.startsWith('✓ ')) {
          completed++;
        }
      });
    }
  });
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { total, completed, percentage };
};

// Function to generate personalized advice
export const generateAdvice = (notes: Note[]): string => {
  if (!notes || notes.length === 0) {
    return "Start creating notes to get personalized advice on your thinking patterns and productivity.";
  }
  
  const topCategories = getTopCategories(notes);
  const actionItemStats = getActionItemStats(notes);
  const hasActionItems = actionItemStats.total > 0;
  
  // Array of possible advice based on different metrics
  const adviceOptions = [
    // Advice based on action item completion
    hasActionItems && actionItemStats.percentage < 30 
      ? `You have ${actionItemStats.total - actionItemStats.completed} open action items. Consider focusing on completing existing tasks before adding new ones.` 
      : null,
    
    hasActionItems && actionItemStats.percentage > 70
      ? `Great job completing ${actionItemStats.completed} out of ${actionItemStats.total} action items! You're making excellent progress.`
      : null,
      
    // Advice based on note-taking patterns
    notes.length < 5
      ? "You're just getting started! Try to add more notes to build connections between your ideas."
      : null,
      
    notes.length > 20
      ? "You have a substantial collection of notes. Consider organizing them into projects or themes."
      : null,
      
    // Advice based on categories
    topCategories.length > 0
      ? `You're focusing most on ${topCategories.join(', ')}. Consider how these areas connect to your larger goals.`
      : null,
      
    // Advice on linking notes together
    notes.length > 5 && notes.some(note => note.keywords.length > 0)
      ? "Try connecting related ideas across different notes to discover new insights."
      : null,
  ];
  
  // Filter null values and select a random piece of advice
  const validAdvice = adviceOptions.filter(advice => advice !== null);
  
  if (validAdvice.length === 0) {
    return "Keep adding more details to your notes to receive more personalized advice.";
  }
  
  // Return a random piece of advice
  return validAdvice[Math.floor(Math.random() * validAdvice.length)] as string;
};

// Function to check if we should show advice (once per 24 hours)
export const shouldShowAdvice = (): boolean => {
  const lastAdviceTime = localStorage.getItem('lastAdviceTime');
  
  if (!lastAdviceTime) {
    localStorage.setItem('lastAdviceTime', Date.now().toString());
    return true;
  }
  
  const hoursSinceLastAdvice = (Date.now() - parseInt(lastAdviceTime)) / (1000 * 60 * 60);
  
  if (hoursSinceLastAdvice >= 24) {
    localStorage.setItem('lastAdviceTime', Date.now().toString());
    return true;
  }
  
  return false;
};
