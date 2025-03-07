
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoteInsight } from '@/types';
import { getNotes } from '@/lib/notes';
import { analyzeNotes } from '@/lib/insights';
import Header from '@/components/Header';
import InsightCard from '@/components/InsightCard';
import EmptyState from '@/components/EmptyState';
import { ConnectionIcon, LightbulbIcon } from 'lucide-react';

const InsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  
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
  
  // Filter insights based on active tab
  const filteredInsights = React.useMemo(() => {
    if (!insights) return [];
    
    if (activeTab === 'all') {
      return insights;
    }
    
    return insights.filter(insight => insight.type === activeTab);
  }, [insights, activeTab]);
  
  // Count insights by type
  const insightCounts = React.useMemo(() => {
    if (!insights) return { connection: 0, theme: 0, trend: 0, actionRequired: 0 };
    
    return {
      connection: insights.filter(i => i.type === 'connection').length,
      theme: insights.filter(i => i.type === 'theme').length,
      trend: insights.filter(i => i.type === 'trend').length,
      actionRequired: insights.filter(i => i.type === 'actionRequired').length,
    };
  }, [insights]);
  
  const isLoading = isLoadingNotes || isGeneratingInsights;
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Insights" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse w-16 h-16 rounded-full bg-muted"></div>
        </div>
      </div>
    );
  }
  
  // Show empty state if there are no insights
  if (!insights || insights.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Insights" showBackButton />
        <main className="flex-1 container max-w-4xl mx-auto px-4 pt-20 pb-10">
          <EmptyState 
            title="Not enough data for insights"
            description="Create at least 3 notes with keywords and categories to generate insights."
            icon={<LightbulbIcon className="h-12 w-12 text-muted-foreground" />}
          />
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Insights" showBackButton />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 pt-20 pb-10">
        <div className="space-y-6 py-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="flex items-center gap-2">
                <LightbulbIcon className="h-8 w-8 text-primary" />
                Insights & Connections
              </span>
            </h1>
            <p className="text-muted-foreground">
              Discover relationships and patterns across your notes
            </p>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full max-w-md mb-4">
              <TabsTrigger value="all" className="flex-1">
                All ({insights.length})
              </TabsTrigger>
              <TabsTrigger value="connection" className="flex-1">
                Connections ({insightCounts.connection})
              </TabsTrigger>
              <TabsTrigger value="trend" className="flex-1">
                Trends ({insightCounts.trend})
              </TabsTrigger>
              <TabsTrigger value="actionRequired" className="flex-1">
                Actions ({insightCounts.actionRequired})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="connection" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="trend" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="actionRequired" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {filteredInsights.length === 0 && (
            <div className="py-8">
              <EmptyState 
                title="No insights found"
                description="Try selecting a different filter or create more notes"
                icon={<ConnectionIcon className="h-12 w-12 text-muted-foreground" />}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InsightsPage;
