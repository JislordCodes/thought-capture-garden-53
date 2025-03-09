import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Network, Sparkles } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const isLoggedIn = true; // Replace with actual authentication logic

  return (
    <div className="min-h-screen bg-background">
      <header className="py-6">
        <h1 className="text-4xl font-bold text-center">Welcome to Thought Garden</h1>
      </header>
      
      <main className="container px-4 py-12 mx-auto">
        <section className="max-w-5xl mx-auto py-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voice Notes</h3>
              <p className="text-muted-foreground mb-4">
                Capture your thoughts naturally with advanced voice recording capabilities.
              </p>
              {isLoggedIn && (
                <Button variant="outline" className="mt-auto" onClick={() => navigate('/notes')}>
                  Start Recording
                </Button>
              )}
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Network className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Insights</h3>
              <p className="text-muted-foreground mb-4">
                Discover connections and patterns across your notes with AI-powered insights.
              </p>
              {isLoggedIn && (
                <Button variant="outline" className="mt-auto" onClick={() => navigate('/insights')}>
                  View Insights
                </Button>
              )}
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mind Maps</h3>
              <p className="text-muted-foreground mb-4">
                Visualize your thoughts with interactive mind maps that reveal connections.
              </p>
              {isLoggedIn && (
                <Button variant="outline" className="mt-auto" onClick={() => navigate('/mindmap')}>
                  Explore Mind Map
                </Button>
              )}
            </div>
          </div>
        </section>
        
        <footer className="py-6 text-center">
          <p className="text-muted-foreground">© 2023 Thought Garden. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
