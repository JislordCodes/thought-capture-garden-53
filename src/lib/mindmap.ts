
import { Note } from '@/types';
import { Node, Edge } from 'reactflow';
import { MindMapNode } from '@/types';

// Helper for creating unique IDs
const getId = () => `${Math.random().toString(36).substring(2, 9)}`;

export const generateMindMapData = (notes: Note[]) => {
  if (!notes || notes.length === 0) return { nodes: [], edges: [] };

  const nodes: Node<MindMapNode>[] = [];
  const edges: Edge[] = [];
  
  // Create center node
  const centerNodeId = 'center-node';
  nodes.push({
    id: centerNodeId,
    type: 'mindMapNode',
    data: {
      label: 'My Notes',
      type: 'center',
    },
    position: { x: 0, y: 0 },
  });
  
  // Group notes by categories
  const categoriesMap: Record<string, Note[]> = {};
  
  notes.forEach(note => {
    note.categories.forEach(category => {
      if (!categoriesMap[category]) {
        categoriesMap[category] = [];
      }
      categoriesMap[category].push(note);
    });
  });
  
  // Sort categories by number of notes
  const sortedCategories = Object.entries(categoriesMap)
    .sort(([, notesA], [, notesB]) => notesB.length - notesA.length)
    .slice(0, 8); // Limit to top 8 categories
  
  // Add category nodes in a circle around center
  sortedCategories.forEach(([category, categoryNotes], index) => {
    const angle = (index / sortedCategories.length) * Math.PI * 2;
    const radius = 180;
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    const categoryNodeId = `category-${getId()}`;
    
    // Add category node
    nodes.push({
      id: categoryNodeId,
      type: 'mindMapNode',
      data: {
        label: category,
        type: 'category',
      },
      position: { x, y },
    });
    
    // Connect category to center
    edges.push({
      id: `e-center-${categoryNodeId}`,
      source: centerNodeId,
      target: categoryNodeId,
      type: 'default',
    });
    
    // Add note nodes for this category (limited to top 5)
    const topNotes = categoryNotes.slice(0, 5);
    
    topNotes.forEach((note, noteIndex) => {
      const notesInCategory = topNotes.length;
      const noteAngle = angle - 0.3 + ((noteIndex / (notesInCategory - 1)) * 0.6 || 0);
      const noteRadius = 320;
      
      const noteX = Math.cos(noteAngle) * noteRadius;
      const noteY = Math.sin(noteAngle) * noteRadius;
      
      const noteNodeId = `note-${note.id}`;
      
      // Add note node
      nodes.push({
        id: noteNodeId,
        type: 'mindMapNode',
        data: {
          label: note.title,
          type: 'note',
          noteId: note.id,
          content: note.content.slice(0, 100) + (note.content.length > 100 ? '...' : ''),
          categories: note.categories,
          keywords: note.keywords,
          actionItems: note.actionItems,
        },
        position: { x: noteX, y: noteY },
      });
      
      // Connect note to category
      edges.push({
        id: `e-${categoryNodeId}-${noteNodeId}`,
        source: categoryNodeId,
        target: noteNodeId,
        type: 'default',
      });
      
      // Connect notes that share keywords
      notes.forEach(otherNote => {
        if (otherNote.id !== note.id) {
          const sharedKeywords = note.keywords.filter(keyword => 
            otherNote.keywords.includes(keyword)
          );
          
          if (sharedKeywords.length > 0) {
            const otherNodeId = `note-${otherNote.id}`;
            const edgeId = `e-${note.id}-${otherNote.id}`;
            
            // Only add edge if both nodes exist and the edge doesn't already exist
            if (
              nodes.some(n => n.id === otherNodeId) && 
              !edges.some(e => 
                (e.source === noteNodeId && e.target === otherNodeId) || 
                (e.source === otherNodeId && e.target === noteNodeId)
              )
            ) {
              edges.push({
                id: edgeId,
                source: noteNodeId,
                target: otherNodeId,
                type: 'default',
                animated: true,
                style: { stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5 5' },
                data: { relationship: 'shared keywords' }
              });
            }
          }
        }
      });
    });
  });
  
  return { nodes, edges };
};
