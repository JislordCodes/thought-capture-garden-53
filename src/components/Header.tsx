
import React from 'react';
import { ArrowLeft, Sparkles, Network } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/UserMenu';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMindMapButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton = false,
  showMindMapButton = false
}) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-sm z-10">
      <div className="container max-w-3xl h-full mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {title ? (
            <h1 className="text-lg font-medium">{title}</h1>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center p-1 bg-primary/10 rounded-full">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">Thought Garden</span>
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showMindMapButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/mindmap')}
              className="flex items-center gap-1"
            >
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Mind Map</span>
            </Button>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
