
import { Note, NoteInsight } from "@/types";

// Helper function to extract unique words from text
const extractSignificantWords = (text: string): string[] => {
  if (!text) return [];
  
  // Convert to lowercase and split by non-alphanumeric characters
  const words = text.toLowerCase().split(/\W+/).filter(word => 
    // Filter out short words and common stop words
    word.length > 3 && 
    !['this', 'that', 'with', 'from', 'have', 'there', 'they', 'their', 'about'].includes(word)
  );
  
  // Return unique words
  return Array.from(new Set(words));
};

// Calculate similarity between two notes based on text content
const calculateSimilarity = (note1: Note, note2: Note): number => {
  // Extract significant words from title, content, and summary
  const words1 = [
    ...extractSignificantWords(note1.title),
    ...extractSignificantWords(note1.content),
    ...extractSignificantWords(note1.summary),
    ...note1.keywords,
    ...note1.categories
  ];
  
  const words2 = [
    ...extractSignificantWords(note2.title),
    ...extractSignificantWords(note2.content),
    ...extractSignificantWords(note2.summary),
    ...note2.keywords,
    ...note2.categories
  ];
  
  // Count common words
  let commonCount = 0;
  for (const word of words1) {
    if (words2.includes(word)) {
      commonCount++;
    }
  }
  
  // Calculate Jaccard similarity coefficient (intersection over union)
  const uniqueWords = new Set([...words1, ...words2]);
  return uniqueWords.size > 0 ? commonCount / uniqueWords.size : 0;
};

// Find thematic connections between notes
const findThematicConnections = (notes: Note[]): NoteInsight[] => {
  if (notes.length < 2) return [];
  
  const insights: NoteInsight[] = [];
  const processedPairs = new Set<string>();
  
  // Find pairs of notes with high similarity
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const similarity = calculateSimilarity(notes[i], notes[j]);
      
      // Only consider pairs with significant similarity
      if (similarity > 0.2) {
        const pairId = [notes[i].id, notes[j].id].sort().join('-');
        
        // Skip if this pair has been processed
        if (processedPairs.has(pairId)) continue;
        processedPairs.add(pairId);
        
        // Find common keywords and categories
        const commonKeywords = notes[i].keywords.filter(k => notes[j].keywords.includes(k));
        const commonCategories = notes[i].categories.filter(c => notes[j].categories.includes(c));
        
        // Generate a descriptive title for the insight
        let title = 'Thematic Connection';
        if (commonCategories.length > 0) {
          title = `Related ${commonCategories[0]} Notes`;
        } else if (commonKeywords.length > 0) {
          title = `Notes about ${commonKeywords.slice(0, 2).join(' & ')}`;
        }
        
        insights.push({
          id: `insight-${Date.now()}-${insights.length}`,
          title,
          description: `These notes share similar themes${commonKeywords.length ? ` around ${commonKeywords.slice(0, 3).join(', ')}` : ''}.`,
          relatedNotes: [
            { noteId: notes[i].id, noteTitle: notes[i].title, relevance: similarity },
            { noteId: notes[j].id, noteTitle: notes[j].title, relevance: similarity }
          ],
          type: 'connection',
          createdAt: new Date()
        });
      }
    }
  }
  
  return insights;
};

// Find related action items across notes
const findActionConnections = (notes: Note[]): NoteInsight[] => {
  if (notes.length < 2) return [];
  
  const insights: NoteInsight[] = [];
  const actionMap = new Map<string, {noteIds: string[], noteTitles: string[]}>();
  
  // Group notes by similar action items
  for (const note of notes) {
    if (!note.actionItems || note.actionItems.length === 0) continue;
    
    for (const action of note.actionItems) {
      const normalizedAction = action.toLowerCase().trim();
      const existing = actionMap.get(normalizedAction) || {noteIds: [], noteTitles: []};
      
      if (!existing.noteIds.includes(note.id)) {
        existing.noteIds.push(note.id);
        existing.noteTitles.push(note.title);
        actionMap.set(normalizedAction, existing);
      }
    }
  }
  
  // Create insights for actions that appear in multiple notes
  for (const [action, data] of actionMap.entries()) {
    if (data.noteIds.length >= 2) {
      insights.push({
        id: `action-${Date.now()}-${insights.length}`,
        title: 'Recurring Action Item',
        description: `"${action}" appears in multiple notes.`,
        relatedNotes: data.noteIds.map((id, index) => ({
          noteId: id,
          noteTitle: data.noteTitles[index],
          relevance: 1.0
        })),
        type: 'actionRequired',
        createdAt: new Date()
      });
    }
  }
  
  return insights;
};

// Find trends and patterns over time
const findTemporalPatterns = (notes: Note[]): NoteInsight[] => {
  if (notes.length < 3) return [];
  
  // Sort notes by creation date
  const sortedNotes = [...notes].sort((a, b) => 
    a.createdAt.getTime() - b.createdAt.getTime()
  );
  
  const insights: NoteInsight[] = [];
  const categoryFrequency = new Map<string, {count: number, recentCount: number, notes: {id: string, title: string}[]}>();
  
  // Calculate category frequencies
  for (const note of sortedNotes) {
    for (const category of note.categories) {
      const existing = categoryFrequency.get(category) || {count: 0, recentCount: 0, notes: []};
      existing.count += 1;
      
      // Check if note is recent (last 30 days)
      const isRecent = (Date.now() - note.createdAt.getTime()) < 30 * 24 * 60 * 60 * 1000;
      if (isRecent) {
        existing.recentCount += 1;
      }
      
      if (!existing.notes.some(n => n.id === note.id)) {
        existing.notes.push({id: note.id, title: note.title});
      }
      
      categoryFrequency.set(category, existing);
    }
  }
  
  // Identify trending categories
  for (const [category, data] of categoryFrequency.entries()) {
    if (data.count >= 3 && data.recentCount >= 2) {
      insights.push({
        id: `trend-${Date.now()}-${insights.length}`,
        title: `Trending Topic: ${category}`,
        description: `You've been writing more about ${category} recently.`,
        relatedNotes: data.notes.slice(0, 5).map(note => ({
          noteId: note.id,
          noteTitle: note.title,
          relevance: 0.8
        })),
        type: 'trend',
        createdAt: new Date()
      });
    }
  }
  
  return insights;
};

// Main function to analyze notes and generate insights
export async function analyzeNotes(notes: Note[]): Promise<NoteInsight[]> {
  if (!notes || notes.length < 2) {
    return [];
  }
  
  // Combine all types of insights
  const thematicInsights = findThematicConnections(notes);
  const actionInsights = findActionConnections(notes);
  const trendInsights = findTemporalPatterns(notes);
  
  const allInsights = [
    ...thematicInsights,
    ...actionInsights,
    ...trendInsights
  ];
  
  // Sort insights by relevance (based on related notes' relevance)
  return allInsights.sort((a, b) => {
    const avgRelevanceA = a.relatedNotes.reduce((sum, n) => sum + n.relevance, 0) / a.relatedNotes.length;
    const avgRelevanceB = b.relatedNotes.reduce((sum, n) => sum + n.relevance, 0) / b.relatedNotes.length;
    return avgRelevanceB - avgRelevanceA;
  });
}
