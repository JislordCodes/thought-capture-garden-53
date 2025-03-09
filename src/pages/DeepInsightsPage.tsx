
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

const DeepInsightsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('mindmap');
  
  // Fetch all notes
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });
  
  // Generate insights based on notes
  const { data: insights, isLoading: isGeneratingInsights } = useQuery({
    queryKey: ['insights', notes],
    queryFn: async () => {
      if (!notes || notes.length < 2) return [];
      return analyzeNotes(notes);
    },
    enabled: !!notes && notes.length >= 2,
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
  
  const isLoading = isLoadingNotes || isGeneratingInsights;
  
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
            <TabsList className="w-full max-w-md grid grid-cols-3 mb-6">
              <TabsTrigger value="mindmap" className="flex items-center gap-2">
                <BrainCircuit size={16} />
                <span>Mind Map</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <CheckSquare size={16} />
                <span>Progress</span>
              </TabsTrigger>
              <TabsTrigger value="advice" className="flex items-center gap-2">
                <Sparkles size={16} />
                <span>Advice</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="mindmap" className="h-[500px] w-full mt-4">
              {mindMapData ? (
                <div className="h-full w-full border rounded-lg overflow-hidden">
                  <MindMap 
                    nodes={mindMapData.nodes} 
                    edges={mindMapData.edges}
                    onNodeClick={(type, noteId) => {
                      if (noteId) {
                        console.log(`Clicked on ${type} node with note ID: ${noteId}`);
                        // Could navigate to note detail page here
                      }
                    }}
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
            
            <TabsContent value="advice" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productivity Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notes && notes.length > 0 ? (
                    <>
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <h3 className="font-medium mb-2">Focus Areas</h3>
                        <p className="text-muted-foreground">
                          Based on your notes, you're focusing most on{' '}
                          {notes
                            .flatMap(note => note.categories)
                            .reduce((acc, category) => {
                              acc[category] = (acc[category] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3)
                            .map(([category]) => category)
                            .join(', ') || 'various topics'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-accent/30 rounded-lg">
                        <h3 className="font-medium mb-2">Action Item Patterns</h3>
                        <p className="text-muted-foreground">
                          {actionItemStats.percentage < 30 ? 
                            "You have many open action items. Consider focusing on completing existing tasks before adding new ones." :
                            actionItemStats.percentage > 70 ? 
                            "Great job completing your action items! You're making excellent progress on your tasks." :
                            "You're making steady progress on your action items. Keep up the balanced approach."
                          }
                        </p>
                      </div>
                      
                      <div className="p-4 bg-secondary/10 rounded-lg">
                        <h3 className="font-medium mb-2">Note-Taking Patterns</h3>
                        <p className="text-muted-foreground">
                          {notes.length < 5 ? 
                            "Keep adding more notes to get better insights and connections between your ideas." :
                            notes.length > 20 ? 
                            "You have a substantial collection of notes. Consider organizing them into projects or themes." :
                            "You're building a good collection of notes. Try connecting related ideas across different notes."
                          }
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground italic">Add more notes to receive personalized advice</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default DeepInsightsPage;
