
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MindMapNode } from '@/types';

type NodeData = MindMapNode;

const getNodeStyle = (type: string) => {
  const baseStyle = {
    borderRadius: '8px',
    padding: '10px 20px',
    minWidth: '120px',
    textAlign: 'center' as const,
    fontWeight: 500,
    border: '1px solid',
  };

  switch (type) {
    case 'center':
      return {
        ...baseStyle,
        backgroundColor: '#818cf880',
        borderColor: '#4f46e5',
        color: '#1e1b4b',
      };
    case 'category':
      return {
        ...baseStyle,
        backgroundColor: '#10b98140',
        borderColor: '#10b981',
        color: '#064e3b',
      };
    case 'keyword':
      return {
        ...baseStyle,
        backgroundColor: '#0ea5e940',
        borderColor: '#0ea5e9',
        color: '#0c4a6e',
      };
    case 'actionItem':
      return {
        ...baseStyle,
        backgroundColor: '#ef444420',
        borderColor: '#ef4444',
        color: '#7f1d1d',
      };
    case 'note':
      return {
        ...baseStyle,
        backgroundColor: '#f59e0b40',
        borderColor: '#f59e0b',
        color: '#78350f',
      };
    default:
      return baseStyle;
  }
};

const MindMapNodeComponent = ({ data }: { data: NodeData }) => {
  const { label, type } = data;
  
  return (
    <div style={getNodeStyle(type)}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555', visibility: type === 'center' ? 'hidden' : 'visible' }}
      />
      <div>{label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default memo(MindMapNodeComponent);
