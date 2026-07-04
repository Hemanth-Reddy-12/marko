import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  type Edge,
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  { id: '1', position: { x: 50, y: 50 }, data: { label: 'REACT' }, style: { border: '4px solid #111', background: '#F4C430', borderRadius: 0, fontWeight: 900, textTransform: 'uppercase' } },
  { id: '2', position: { x: 50, y: 150 }, data: { label: 'EXPRESS' }, style: { border: '4px solid #111', background: '#fff', borderRadius: 0, fontWeight: 900 } },
  { id: '3', position: { x: 50, y: 250 }, data: { label: 'AI AGENTS' }, style: { border: '4px solid #111', background: '#2563EB', color: '#fff', borderRadius: 0, fontWeight: 900 } },
  { id: '4', position: { x: 250, y: 150 }, data: { label: 'REDIS' }, style: { border: '4px solid #111', background: '#E63946', color: '#fff', borderRadius: 0, fontWeight: 900 } },
  { id: '5', position: { x: 250, y: 250 }, data: { label: 'PRISMA' }, style: { border: '4px solid #111', background: '#fff', borderRadius: 0, fontWeight: 900 } },
  { id: '6', position: { x: 250, y: 350 }, data: { label: 'POSTGRESQL' }, style: { border: '4px solid #111', background: '#F4C430', borderRadius: 0, fontWeight: 900 } },
  { id: '7', position: { x: 450, y: 150 }, data: { label: 'SOCKET.IO' }, style: { border: '4px solid #111', background: '#fff', borderRadius: 0, fontWeight: 900 } },
  { id: '8', position: { x: 450, y: 250 }, data: { label: 'INTERVIEW ENGINE' }, style: { border: '4px solid #111', background: '#2563EB', color: '#fff', borderRadius: 0, fontWeight: 900 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'straight', style: { strokeWidth: 4, stroke: '#111' }, animated: true },
  { id: 'e2-3', source: '2', target: '3', type: 'straight', style: { strokeWidth: 4, stroke: '#111' } },
  { id: 'e2-4', source: '2', target: '4', type: 'straight', style: { strokeWidth: 4, stroke: '#111' } },
  { id: 'e3-5', source: '3', target: '5', type: 'straight', style: { strokeWidth: 4, stroke: '#111' } },
  { id: 'e5-6', source: '5', target: '6', type: 'straight', style: { strokeWidth: 4, stroke: '#111' } },
  { id: 'e4-7', source: '4', target: '7', type: 'straight', style: { strokeWidth: 4, stroke: '#111' }, animated: true },
  { id: 'e7-8', source: '7', target: '8', type: 'straight', style: { strokeWidth: 4, stroke: '#111' }, animated: true },
  { id: 'e3-8', source: '3', target: '8', type: 'straight', style: { strokeWidth: 4, stroke: '#111' } },
];

export function ArchitectureDiagram() {
    return (
        <section id="architecture" className="w-full bg-white border-b-4 border-black relative">
            <div className="border-b-4 border-black px-6 py-12">
                <div className="max-w-[1440px] mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black">
                        SYSTEM ARCHITECTURE
                    </h2>
                </div>
            </div>
            <div className="w-full h-[600px] bg-background">
                <ReactFlow 
                    nodes={initialNodes} 
                    edges={initialEdges}
                    fitView
                    proOptions={{ hideAttribution: true }}
                >
                    <Background color="#111" variant={BackgroundVariant.Lines} gap={50} lineWidth={2} style={{ opacity: 0.1 }} />
                    <Controls className="border-2 border-black rounded-none shadow-[4px_4px_0px_rgba(17,17,17,1)]" />
                </ReactFlow>
            </div>
        </section>
    );
}
