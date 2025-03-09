
import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { MindMapNode } from '@/types';
import { ChevronDown, ChevronUp, Tag, List, CheckSquare } from 'lucide-react';

type NodeData = MindMapNode;

const getNodeStyle = (type: string, expanded: boolean) => {
  const baseStyle = {
    borderRadius: '8px',
    padding: '10px 15px',
    minWidth: '120px',
    maxWidth: type === 'note' && expanded ? '300px' : '180px',
    textAlign: 'center' as const,
    fontWeight: 500,
    border: '1px solid',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  switch (type) {
    case 'center':
      return {
        ...baseStyle,
        backgroundColor: '#818cf880',
        borderColor: '#4f46e5',
        color: '#1e1b4b',
        fontWeight: 'bold' as const,
        fontSize: '16px',
      };
    case 'category':
      return {
        ...baseStyle,
        backgroundColor: '#10b98140',
        borderColor: '#10b981',
        color: '#064e3b',
      };
    case 'note':
      return {
        ...baseStyle,
        backgroundColor: expanded ? '#f59e0b60' : '#f59e0b40',
        borderColor: '#f59e0b',
        color: '#78350f',
        textAlign: 'left' as const,
      };
    default:
      return baseStyle;
  }
};

const MindMapNodeComponent = ({ data }: { data: NodeData }) => {
  const { label, type, noteId, content, categories, keywords, actionItems } = data;
  const [expanded, setExpanded] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'note') {
      setExpanded(!expanded);
    }
  };
  
  const style = getNodeStyle(type, expanded);
  
  return (
    <div 
      style={style} 
      onClick={handleClick}
      className="nodrag" // Make the content not draggable
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555', visibility: type === 'center' ? 'hidden' : 'visible' }}
      />
      <div className="flex items-center justify-between">
        <div className="font-medium">{label}</div>
        {type === 'note' && (
          <div className="ml-2">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        )}
      </div>
      
      {type === 'note' && expanded && (
        <div className="mt-2 text-sm">
          <div className="text-xs text-muted-foreground mt-1">{content}</div>
          
          {keywords && keywords.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center text-xs font-medium">
                <Tag size={12} className="mr-1" />
                <span>Keywords:</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {keywords.slice(0, 3).map((keyword, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                    {keyword}
                  </span>
                ))}
                {keywords.length > 3 && (
                  <span className="text-xs">+{keywords.length - 3} more</span>
                )}
              </div>
            </div>
          )}
          
          {actionItems && actionItems.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center text-xs font-medium">
                <CheckSquare size={12} className="mr-1" />
                <span>Action Items:</span>
              </div>
              <div className="mt-1">
                <ul className="list-none text-xs space-y-1">
                  {actionItems.slice(0, 2).map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-1">•</span> 
                      <span className="truncate">{item.length > 30 ? item.substring(0, 30) + '...' : item}</span>
                    </li>
                  ))}
                  {actionItems.length > 2 && (
                    <li className="text-xs">+{actionItems.length - 2} more items</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default memo(MindMapNodeComponent);
