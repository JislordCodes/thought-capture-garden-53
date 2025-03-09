
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { BookOpen, Tag, Hash, CheckSquare } from 'lucide-react';

interface NodeProps {
  data: {
    label: string;
    type?: 'note' | 'keyword' | 'category' | 'actionItem' | 'center';
    noteId?: string;
  };
  id: string;
}

export const NoteNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="min-w-[150px] max-w-[250px] p-3 rounded-lg border border-border bg-background shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-medium truncate">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
};

export const KeywordNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="px-3 py-2 rounded-full bg-indigo-100 border border-indigo-200 shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      <div className="flex items-center gap-1.5">
        <Hash className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span className="text-xs font-medium text-indigo-800">{data.label}</span>
      </div>
    </div>
  );
};

export const CategoryNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="px-3 py-2 rounded-full bg-purple-100 border border-purple-200 shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <div className="flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        <span className="text-xs font-medium text-purple-800">{data.label}</span>
      </div>
    </div>
  );
};

export const ActionItemNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="px-3 py-2 rounded-full bg-pink-100 border border-pink-200 shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-pink-500" />
      <div className="flex items-center gap-1.5">
        <CheckSquare className="w-3.5 h-3.5 text-pink-600 shrink-0" />
        <span className="text-xs font-medium text-pink-800">{data.label}</span>
      </div>
    </div>
  );
};

export const CenterNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="p-4 rounded-full bg-primary text-primary-foreground font-medium shadow-md min-w-32 text-center">
      <Handle type="source" position={Position.Bottom} className="!bg-primary-foreground" />
      {data.label}
    </div>
  );
};
