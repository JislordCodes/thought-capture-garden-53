
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNotes } from '@/lib/notes';
import { analyzeNotes } from '@/lib/insights';
import { generateMindMapData } from '@/lib/mindmap';
import Header from '@/components/Header';
import InsightCard from '@/components/InsightCard';
import EmptyState from '@/components/EmptyState';
import MindMap from '@/components/mindmap/MindMap';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LightbulbIcon, 
  BrainIcon, 
  NetworkIcon, 
  TrendingUpIcon, 
  CheckCircleIcon, 
  Sparkles 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DeepInsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('mindmap');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch notes data
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });
  
  // Generate insights from notes
  const { data: insights, isLoading: isGeneratingInsights } = useQuery({
    queryKey: ['insights', notes],
    queryFn: async () => {
      if (!notes || notes.length < 2) return [];
      return analyzeNotes(notes);
    },
    enabled: !!notes && notes.length >= 2,
  });
  
  // Filter insights based on type
  const filteredInsights = React.useMemo(() => {
    if (!insights) return [];
    
    if (activeTab === 'all') {
      return insights;
    } else if (activeTab === 'connections') {
      return insights.filter(insight => insight.type === 'connection');
    } else if (activeTab === 'trends') {
      return insights.filter(insight => insight.type === 'trend');
    } else if (activeTab === 'actions') {
      return insights.filter(insight => insight.type === 'actionRequired');
    }
    
    return insights;
  }, [insights, activeTab]);
  
  // Generate mind map data from notes
  const mindMapData = React.useMemo(() => {
    if (!notes || notes.length === 0) return { nodes: [], edges: [] };
    return generateMindMapData(notes);
  }, [notes]);
  
  // Handle node click navigation
  const handleNodeClick = React.useCallback((nodeId: string, nodeType: string, noteId?: string) => {
    if (nodeType === 'note' && noteId) {
      navigate(`/notes/${noteId}`);
    } else {
      toast({
        title: `${nodeType} selected`,
        description: `You clicked on ${nodeId}`,
      });
    }
  }, [navigate, toast]);
  
  // Count insights by type
  const insightCounts = React.useMemo(() => {
    if (!insights) return { connection: 0, trend: 0, actionRequired: 0 };
    
    return {
      connection: insights.filter(i => i.type === 'connection').length,
      trend: insights.filter(i => i.type === 'trend').length,
      actionRequired: insights.filter(i => i.type === 'actionRequired').length,
    };
  }, [insights]);
  
  const isLoading = isLoadingNotes || isGeneratingInsights;
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Deep Insights" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <BrainIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="h-4 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show empty state if not enough data
  if (!notes || notes.length < 2) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Deep Insights" showBackButton />
        <main className="flex-1 container max-w-4xl mx-auto px-4 pt-20 pb-10">
          <EmptyState 
            title="Not enough data for insights"
            description="Create at least 2 notes with keywords and categories to generate insights and mind maps."
            icon={<BrainIcon className="h-12 w-12 text-muted-foreground" />}
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
      <Header title="Deep Insights" showBackButton />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 pt-20 pb-10">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="flex items-center gap-2">
              <BrainIcon className="h-8 w-8 text-primary" />
              Deep Insights
            </span>
          </h1>
          <p className="text-muted-foreground">
            Discover patterns, connections, and actionable insights from your notes
          </p>
        </div>
        
        <Tabs defaultValue="mindmap" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full mb-8 grid grid-cols-3 h-auto p-1">
            <TabsTrigger value="mindmap" className="py-3 flex items-center gap-2">
              <NetworkIcon className="h-4 w-4" />
              <span>Mind Map</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="py-3 flex items-center gap-2">
              <LightbulbIcon className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="py-3 flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4" />
              <span>Goal Analysis</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Mind Map Tab */}
          <TabsContent value="mindmap" className="space-y-6">
            <div className="h-[600px] w-full bg-slate-50 border rounded-lg overflow-hidden shadow-sm">
              <MindMap 
                nodes={mindMapData.nodes}
                edges={mindMapData.edges}
                onNodeClick={handleNodeClick}
              />
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Click on any note node to navigate to that note
            </div>
          </TabsContent>
          
          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Connections &amp; Patterns</h3>
              <Tabs defaultValue="all" className="w-auto">
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-3">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="connections" className="text-xs px-3">
                    Connections
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="text-xs px-3">
                    Trends
                  </TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs px-3">
                    Actions
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
              
              {filteredInsights.length === 0 && (
                <div className="col-span-2 py-12">
                  <EmptyState 
                    title="No insights found"
                    description="Try selecting a different filter or create more notes with keywords and categories"
                    icon={<LightbulbIcon className="h-10 w-10 text-muted-foreground" />}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Goals Analysis Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-emerald-500" />
                    Goal Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notes.some(note => note.categories.includes('Goal')) ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Based on your notes, here's your progress on stated goals:
                      </p>
                      <ul className="space-y-2">
                        {notes
                          .filter(note => note.categories.includes('Goal'))
                          .map(note => (
                            <li key={note.id} className="text-sm flex items-start gap-2">
                              <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5" />
                              <div>
                                <p className="font-medium">{note.title}</p>
                                <p className="text-muted-foreground text-xs">{note.summary.substring(0, 100)}...</p>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No goals found in your notes. Try adding the "Goal" category to your notes.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Personalized Advice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insights && insights.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Based on patterns in your notes, consider these recommendations:
                      </p>
                      <ul className="space-y-3">
                        {insights
                          .filter(insight => insight.type === 'actionRequired')
                          .slice(0, 3)
                          .map(insight => (
                            <li key={insight.id} className="text-sm border-l-2 border-primary pl-3 py-1">
                              <p>{insight.description}</p>
                            </li>
                          ))}
                        {insights
                          .filter(insight => insight.type === 'trend')
                          .slice(0, 2)
                          .map(insight => (
                            <li key={insight.id} className="text-sm border-l-2 border-emerald-500 pl-3 py-1">
                              <p>Continue your momentum with {insight.title.replace('Trending Topic: ', '')}.</p>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Add more notes to receive personalized advice based on your content.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DeepInsightsPage;
