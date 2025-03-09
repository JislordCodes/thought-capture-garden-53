
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { getNotes } from '@/lib/notes';
import { analyzeNotes } from '@/lib/insights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, BrainCircuit, CheckSquare } from 'lucide-react';
import MindMap from '@/components/mindmap/MindMap';
import { generateMindMapData } from '@/lib/mindmap';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const DeepInsightsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('mindmap');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch all notes
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });
  
  // Calculate action item metrics
  const actionItemStats = React.useMemo(() => {
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
  }, [notes]);
  
  // Generate mind map data
  const mindMapData = React.useMemo(() => {
    if (!notes || notes.length === 0) return null;
    return generateMindMapData(notes);
  }, [notes]);
  
  const handleNodeClick = (type: string, noteId?: string) => {
    if (type === 'note' && noteId) {
      navigate(`/notes/${noteId}`);
    }
  };
  
  const isLoading = isLoadingNotes;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Deep Insights" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse w-16 h-16 rounded-full bg-muted"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Deep Insights" showBackButton />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 pt-20 pb-10">
        <div className="space-y-6 py-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Deep Insights
              </span>
            </h1>
            <p className="text-muted-foreground">
              Visual exploration and progress tracking of your thoughts
            </p>
          </div>
          
          <Tabs defaultValue="mindmap" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full max-w-md grid grid-cols-2 mb-6">
              <TabsTrigger value="mindmap" className="flex items-center gap-2">
                <BrainCircuit size={16} />
                <span>Mind Map</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <CheckSquare size={16} />
                <span>Progress</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="mindmap" className="h-[600px] w-full mt-4">
              {mindMapData ? (
                <div className="h-full w-full border rounded-lg overflow-hidden">
                  <MindMap 
                    nodes={mindMapData.nodes} 
                    edges={mindMapData.edges}
                    onNodeClick={handleNodeClick}
                  />
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center border rounded-lg">
                  <p className="text-muted-foreground">Add more notes to generate a mind map</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="progress" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Action Item Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{actionItemStats.percentage}%</span>
                    </div>
                    <Progress value={actionItemStats.percentage} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium text-muted-foreground">Completed</div>
                      <div className="text-2xl font-bold">{actionItemStats.completed}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium text-muted-foreground">Total</div>
                      <div className="text-2xl font-bold">{actionItemStats.total}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {notes && notes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes with Most Action Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {notes
                        .filter(note => note.actionItems && note.actionItems.length > 0)
                        .sort((a, b) => b.actionItems.length - a.actionItems.length)
                        .slice(0, 5)
                        .map(note => (
                          <div key={note.id} className="flex justify-between items-center">
                            <div className="font-medium truncate max-w-[250px]">{note.title}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {note.actionItems.filter(item => item.startsWith('✓ ')).length} / {note.actionItems.length}
                              </span>
                              <Progress 
                                value={(note.actionItems.filter(item => item.startsWith('✓ ')).length / note.actionItems.length) * 100}
                                className="w-24 h-2"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default DeepInsightsPage;
