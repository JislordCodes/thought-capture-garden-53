
import { Note } from "@/types";

// Define types for mind map nodes and edges
export interface MindMapNode {
  id: string;
  data: {
    label: string;
    type?: 'note' | 'keyword' | 'category' | 'actionItem';
    noteId?: string;
  };
  position: { x: number, y: number };
  type?: string;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: React.CSSProperties;
  label?: string;
}

/**
 * Generates nodes and edges for a mind map based on notes
 */
export function generateMindMapData(notes: Note[]): { nodes: MindMapNode[], edges: MindMapEdge[] } {
  if (!notes || notes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];
  const processedKeywords = new Set<string>();
  const processedCategories = new Set<string>();
  
  // Calculate the central position
  const centerX = 0;
  const centerY = 0;
  
  // Create the central "Notes" node
  nodes.push({
    id: 'center',
    data: { label: 'My Thoughts', type: 'center' },
    position: { x: centerX, y: centerY },
    type: 'special'
  });
  
  // Positioning calculations
  const noteRadius = 300; // Distance of notes from center
  const angle = (2 * Math.PI) / notes.length; // Angle between notes
  
  // Process each note
  notes.forEach((note, noteIndex) => {
    // Create note node
    const noteId = `note-${note.id}`;
    const noteAngle = noteIndex * angle;
    const noteX = centerX + noteRadius * Math.cos(noteAngle);
    const noteY = centerY + noteRadius * Math.sin(noteAngle);
    
    nodes.push({
      id: noteId,
      data: { 
        label: note.title,
        type: 'note',
        noteId: note.id 
      },
      position: { x: noteX, y: noteY },
    });
    
    // Connect to center
    edges.push({
      id: `edge-center-${noteId}`,
      source: 'center',
      target: noteId,
    });
    
    // Process keywords
    const keywordRadius = 150; // Distance of keywords from their note
    const keywordCount = note.keywords.length;
    const keywordAngle = keywordCount > 0 ? (2 * Math.PI) / keywordCount : 0;
    
    note.keywords.forEach((keyword, keywordIndex) => {
      if (keyword.trim() === '') return;
      
      const keywordId = `keyword-${keyword.replace(/\s+/g, '-').toLowerCase()}`;
      
      // Only add the keyword node if we haven't processed it yet
      if (!processedKeywords.has(keywordId)) {
        processedKeywords.add(keywordId);
        
        const kAngle = noteAngle + (keywordIndex * keywordAngle) * 0.5;
        const keywordX = noteX + keywordRadius * Math.cos(kAngle);
        const keywordY = noteY + keywordRadius * Math.sin(kAngle);
        
        nodes.push({
          id: keywordId,
          data: { 
            label: keyword,
            type: 'keyword'
          },
          position: { x: keywordX, y: keywordY },
          type: 'keyword'
        });
      }
      
      // Connect keyword to note
      edges.push({
        id: `edge-${noteId}-${keywordId}`,
        source: noteId,
        target: keywordId,
        style: { stroke: '#6366f1' } // Indigo color for keywords
      });
    });
    
    // Process categories
    const categoryRadius = 200; // Distance of categories from their note
    const categoryCount = note.categories.length;
    const categoryAngle = categoryCount > 0 ? (2 * Math.PI) / categoryCount : 0;
    
    note.categories.forEach((category, categoryIndex) => {
      if (category.trim() === '') return;
      
      const categoryId = `category-${category.replace(/\s+/g, '-').toLowerCase()}`;
      
      // Only add the category node if we haven't processed it yet
      if (!processedCategories.has(categoryId)) {
        processedCategories.add(categoryId);
        
        const cAngle = noteAngle + (categoryIndex * categoryAngle) * 0.5;
        const categoryX = noteX + categoryRadius * Math.cos(cAngle);
        const categoryY = noteY + categoryRadius * Math.sin(cAngle);
        
        nodes.push({
          id: categoryId,
          data: { 
            label: category,
            type: 'category'
          },
          position: { x: categoryX, y: categoryY },
          type: 'category'
        });
      }
      
      // Connect category to note
      edges.push({
        id: `edge-${noteId}-${categoryId}`,
        source: noteId,
        target: categoryId,
        style: { stroke: '#8b5cf6' } // Purple color for categories
      });
    });
    
    // Process action items
    if (note.actionItems && note.actionItems.length > 0) {
      const actionRadius = 180;
      const actionCount = note.actionItems.length;
      const actionAngle = actionCount > 0 ? (2 * Math.PI) / actionCount : 0;
      
      note.actionItems.forEach((action, actionIndex) => {
        if (!action || action.trim() === '') return;
        
        // Truncate long action items for the node label
        const shortAction = action.length > 30 ? action.substring(0, 27) + '...' : action;
        const actionId = `action-${noteId}-${actionIndex}`;
        
        const aAngle = noteAngle + (actionIndex * actionAngle) * 0.5;
        const actionX = noteX + actionRadius * Math.cos(aAngle);
        const actionY = noteY + actionRadius * Math.sin(aAngle);
        
        nodes.push({
          id: actionId,
          data: { 
            label: shortAction,
            type: 'actionItem'
          },
          position: { x: actionX, y: actionY },
          type: 'actionItem'
        });
        
        // Connect action to note
        edges.push({
          id: `edge-${noteId}-${actionId}`,
          source: noteId,
          target: actionId,
          style: { stroke: '#ec4899' } // Pink color for action items
        });
      });
    }
  });
  
  return { nodes, edges };
}
