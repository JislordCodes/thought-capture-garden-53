
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getNotes } from '@/lib/notes';
import { generateMindMapData } from '@/lib/mindmap';
import Header from '@/components/Header';
import MindMap from '@/components/mindmap/MindMap';
import EmptyState from '@/components/EmptyState';
import { NetworkIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MindMapPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Fetch notes data
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });
  
  // Generate mind map data from notes
  const mindMapData = React.useMemo(() => {
    if (!notes || notes.length === 0) return { nodes: [], edges: [] };
    return generateMindMapData(notes);
  }, [notes]);
  
  // Handle node click navigation
  const handleNodeClick = useCallback((nodeId: string, nodeType: string, noteId?: string) => {
    if (nodeType === 'note' && noteId) {
      navigate(`/notes/${noteId}`);
    }
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Mind Map" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-muted mb-4"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!notes || notes.length < 2) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Mind Map" showBackButton />
        <main className="flex-1 container max-w-4xl mx-auto px-4 pt-20 pb-10">
          <EmptyState 
            title="Not enough data for mind mapping"
            description="Create at least 2 notes with keywords and categories to visualize connections."
            icon={<NetworkIcon className="h-12 w-12 text-muted-foreground" />}
          />
          <div className="flex justify-center mt-6">
            <Button onClick={() => navigate('/notes')}>
              Go to My Notes
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Mind Map" showBackButton />
      
      <main className="flex-1 flex flex-col pt-16">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Thought Connections
              </span>
            </h1>
            <p className="text-muted-foreground">
              Explore the connections between your thoughts, keywords, and categories
            </p>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-slate-50 border-t">
          <MindMap 
            nodes={mindMapData.nodes}
            edges={mindMapData.edges}
            onNodeClick={handleNodeClick}
          />
        </div>
      </main>
    </div>
  );
};

export default MindMapPage;
