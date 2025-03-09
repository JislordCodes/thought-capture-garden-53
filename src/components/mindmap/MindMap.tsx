
import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Node,
  Edge,
  NodeTypes,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MindMapNode, MindMapEdge } from '@/lib/mindmap';
import { NoteNode, KeywordNode, CategoryNode, ActionItemNode, CenterNode } from './MindMapNodes';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MindMapProps {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  onNodeClick?: (nodeId: string, nodeType: string, noteId?: string) => void;
}

const nodeTypes: NodeTypes = {
  default: NoteNode,
  keyword: KeywordNode,
  category: CategoryNode,
  actionItem: ActionItemNode,
  special: CenterNode,
};

const MindMap: React.FC<MindMapProps> = ({ nodes: initialNodes, edges: initialEdges, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [hasFitView, setHasFitView] = useState(false);

  // Reference to the ReactFlow instance
  const reactFlowInstance = React.useRef<any>(null);

  // Handle node click
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeClick && node.data.type) {
        // Fix: Explicitly type the node.data.type as string
        const nodeType: string = node.data.type as string;
        // Fix: Explicitly cast noteId to string or undefined to match the function signature
        const noteId = node.data.noteId ? String(node.data.noteId) : undefined;
        onNodeClick(node.id, nodeType, noteId);
      }
    },
    [onNodeClick]
  );

  // Fit view on first render or when nodes change
  React.useEffect(() => {
    if (reactFlowInstance.current && nodes.length > 0 && !hasFitView) {
      setTimeout(() => {
        reactFlowInstance.current.fitView({ padding: 0.2 });
        setHasFitView(true);
      }, 100);
    }
  }, [nodes, hasFitView]);

  // Handle fit view button click
  const handleFitView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.2 });
    }
  }, []);

  return (
    <div className="h-full w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        connectionLineType={ConnectionLineType.SmoothStep}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-slate-50"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={16} />
        <Controls showInteractive={false} />
        
        <Panel position="top-right" className="space-x-2">
          <Button variant="outline" size="icon" onClick={() => {
            if (reactFlowInstance.current) {
              reactFlowInstance.current.zoomIn();
            }
          }}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => {
            if (reactFlowInstance.current) {
              reactFlowInstance.current.zoomOut();
            }
          }}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleFitView}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default MindMap;
