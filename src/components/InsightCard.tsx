
import React from 'react';
import { Link } from 'react-router-dom';
import { NoteInsight } from '@/types';
import { cn } from '@/lib/utils';
import { 
  LightbulbIcon, 
  ArrowRightIcon, 
  TrendingUpIcon, 
  ConnectionIcon,
  CheckCircleIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InsightCardProps {
  insight: NoteInsight;
  className?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, className }) => {
  // Select the appropriate icon based on insight type
  const getInsightIcon = () => {
    switch (insight.type) {
      case 'theme':
        return <LightbulbIcon className="h-5 w-5 text-amber-500" />;
      case 'connection':
        return <ConnectionIcon className="h-5 w-5 text-indigo-500" />;
      case 'trend':
        return <TrendingUpIcon className="h-5 w-5 text-emerald-500" />;
      case 'actionRequired':
        return <CheckCircleIcon className="h-5 w-5 text-rose-500" />;
      default:
        return <LightbulbIcon className="h-5 w-5 text-primary" />;
    }
  };

  // Get the appropriate color for the insight type
  const getInsightColor = () => {
    switch (insight.type) {
      case 'theme':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'connection':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'trend':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'actionRequired':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  // Format insight type for display
  const formatInsightType = (type: string) => {
    switch (type) {
      case 'theme':
        return 'Theme';
      case 'connection':
        return 'Connection';
      case 'trend':
        return 'Trend';
      case 'actionRequired':
        return 'Action Item';
      default:
        return type;
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-md",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className={cn(getInsightColor(), "flex items-center gap-1 px-2 py-1")}>
            {getInsightIcon()}
            <span>{formatInsightType(insight.type)}</span>
          </Badge>
        </div>
        <CardTitle className="text-lg font-medium">{insight.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{insight.description}</p>
        
        <div className="space-y-2">
          <h4 className="text-xs font-medium uppercase text-muted-foreground">Related Notes</h4>
          <ul className="space-y-2">
            {insight.relatedNotes.map((note) => (
              <li key={note.noteId} className="text-sm">
                <Link 
                  to={`/notes/${note.noteId}`}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                  <span className="line-clamp-1">{note.noteTitle}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
