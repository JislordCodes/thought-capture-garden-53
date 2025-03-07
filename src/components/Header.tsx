
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Thought Garden", 
  showBackButton = false 
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border py-4 px-6">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Link 
              to="/" 
              className="p-2 rounded-full hover:bg-accent transition-colors duration-200 focus-ring"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </Link>
          )}
          <h1 className="text-xl font-medium tracking-tight">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {!isHomePage && (
            <Link 
              to="/notes" 
              className="p-2 rounded-full hover:bg-accent transition-colors duration-200 focus-ring"
              aria-label="View all notes"
            >
              <Menu size={20} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
