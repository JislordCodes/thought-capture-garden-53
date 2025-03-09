
import { Note } from '@/types';
import { Node, Edge } from 'reactflow';
import { MindMapNode } from '@/types';

// Helper for creating unique IDs
const getId = () => `${Math.random().toString(36).substring(2, 9)}`;

// Helper to get a mapping of frequencies
const getFrequencyMap = <T>(items: T[]): Map<T, number> => {
  const map = new Map<T, number>();
  items.forEach(item => {
    map.set(item, (map.get(item) || 0) + 1);
  });
  return map;
};

// Sort entries by frequency in descending order
const getSortedEntries = <T>(map: Map<T, number>): [T, number][] => {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
};

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
      label: 'My Thoughts',
      type: 'center',
    },
    position: { x: 0, y: 0 },
  });
  
  // Extract all categories, keywords, and action items
  const allCategories = notes.flatMap(note => note.categories || []);
  const allKeywords = notes.flatMap(note => note.keywords || []);
  const allActionItems = notes.flatMap(note => note.actionItems || [])
    .filter(item => !item.startsWith('✓ ')) // Only include uncompleted items
    .map(item => item.startsWith('✓ ') ? item.substring(2) : item);
  
  // Get frequency maps
  const categoryFrequency = getFrequencyMap(allCategories);
  const keywordFrequency = getFrequencyMap(allKeywords);
  const actionItemFrequency = getFrequencyMap(allActionItems);
  
  // Sort by frequency
  const topCategories = getSortedEntries(categoryFrequency).slice(0, 5);
  const topKeywords = getSortedEntries(keywordFrequency).slice(0, 8);
  const topActionItems = getSortedEntries(actionItemFrequency).slice(0, 5);
  
  // Calculate angles for positioning nodes around the center
  const totalNodes = topCategories.length + topKeywords.length + topActionItems.length;
  
  // Add category nodes
  topCategories.forEach(([category, count], index) => {
    const angle = (index / topCategories.length) * Math.PI * 2;
    const radius = 200;
    
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
    
    // Add related note nodes for this category
    const relatedNotes = notes.filter(n => n.categories.includes(category)).slice(0, 3);
    
    relatedNotes.forEach((note, noteIndex) => {
      const noteAngle = angle - 0.3 + (noteIndex / relatedNotes.length) * 0.6;
      const noteRadius = 350;
      
      const noteX = Math.cos(noteAngle) * noteRadius;
      const noteY = Math.sin(noteAngle) * noteRadius;
      
      const noteNodeId = `note-${note.id}-${getId()}`;
      
      // Add note node
      nodes.push({
        id: noteNodeId,
        type: 'mindMapNode',
        data: {
          label: note.title,
          type: 'note',
          noteId: note.id,
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
    });
  });
  
  // Add keyword nodes
  topKeywords.forEach(([keyword, count], index) => {
    const angle = (index / topKeywords.length) * Math.PI * 2;
    const radius = 250;
    
    const x = Math.cos(angle + Math.PI / 2) * radius;
    const y = Math.sin(angle + Math.PI / 2) * radius;
    
    const keywordNodeId = `keyword-${getId()}`;
    
    // Add keyword node
    nodes.push({
      id: keywordNodeId,
      type: 'mindMapNode',
      data: {
        label: keyword,
        type: 'keyword',
      },
      position: { x, y },
    });
    
    // Connect keyword to center
    edges.push({
      id: `e-center-${keywordNodeId}`,
      source: centerNodeId,
      target: keywordNodeId,
      type: 'default',
    });
  });
  
  // Add action item nodes
  topActionItems.forEach(([actionItem, count], index) => {
    const angle = (index / topActionItems.length) * Math.PI * 2;
    const radius = 200;
    
    const x = Math.cos(angle + Math.PI) * radius;
    const y = Math.sin(angle + Math.PI) * radius;
    
    const actionItemNodeId = `action-${getId()}`;
    
    // Add action item node
    nodes.push({
      id: actionItemNodeId,
      type: 'mindMapNode',
      data: {
        label: actionItem.length > 30 ? actionItem.substring(0, 30) + '...' : actionItem,
        type: 'actionItem',
      },
      position: { x, y },
    });
    
    // Connect action item to center
    edges.push({
      id: `e-center-${actionItemNodeId}`,
      source: centerNodeId,
      target: actionItemNodeId,
      type: 'default',
    });
  });
  
  return { nodes, edges };
};
