
import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MindMapNode } from '@/types';
import MindMapNodeComponent from './MindMapNodeComponent';

const nodeTypes: NodeTypes = {
  mindMapNode: MindMapNodeComponent,
};

type MindMapProps = {
  nodes: Node<MindMapNode>[];
  edges: Edge[];
  onNodeClick?: (type: string, noteId?: string) => void;
};

const MindMap: React.FC<MindMapProps> = ({ nodes, edges, onNodeClick }) => {
  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);
  
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (onNodeClick && node.data) {
      // Handle the type casting for safer TypeScript usage
      const type = String(node.data.type || '');
      const noteId = node.data.noteId ? String(node.data.noteId) : undefined;
      onNodeClick(type, noteId);
    }
  }, [onNodeClick]);

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-right"
      minZoom={0.2}
      maxZoom={1.5}
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
    >
      <Controls />
      <MiniMap
        nodeStrokeColor={(n) => {
          if (n.type === 'mindMapNode') return '#0041d0';
          return '#eee';
        }}
        nodeColor={(n) => {
          if (n.data?.type === 'center') return '#4f46e5';
          if (n.data?.type === 'category') return '#10b981';
          if (n.data?.type === 'note') return '#f59e0b';
          return '#eee';
        }}
        maskColor="#f8fafc40"
      />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
};

export default MindMap;
