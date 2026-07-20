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
  { 
    id: '1', 
    position: { x: 50, y: 50 }, 
    data: { label: 'REACT' }, 
    style: { 
      border: '4px solid var(--border)', 
      background: 'var(--color-secondary)', 
      color: '#000000', 
      borderRadius: 0, 
      fontWeight: 900, 
      textTransform: 'uppercase',
      padding: '10px 18px',
      boxShadow: '4px 4px 0px 0px var(--foreground)'
    } 
  },
  { 
    id: '2', 
    position: { x: 50, y: 150 }, 
    data: { label: 'EXPRESS' }, 
    style: { 
      border: '4px solid var(--border)', 
      background: 'var(--card)', 
      color: 'var(--card-foreground)', 
      borderRadius: 0, 
      fontWeight: 900,
      padding: '10px 18px',
      boxShadow: '4px 4px 0px 0px var(--foreground)'
    } 
  },
  { 
    id: '3', 
    position: { x: 50, y: 250 }, 
    data: { label: 'AI AGENTS' }, 
    style: { 
      border: '4px solid var(--border)', 
      background: 'var(--color-accent)', 
      color: '#ffffff', 
      borderRadius: 0, 
      fontWeight: 900,
      padding: '10px 18px',
      boxShadow: '4px 4px 0px 0px var(--foreground)'
    } 
  },
  { 
    id: '4', 
    position: { x: 250, y: 150 }, 
    data: { label: 'REDIS' }, 
    style: { 
      border: '4px solid var(--border)', 
      background: 'var(--color-bauhaus-red)', 
      color: '#ffffff', 
      borderRadius: 0, 
      fontWeight: 900,
      padding: '10px 18px',
      boxShadow: '4px 4px 0px 0px var(--foreground)'
    } 
  },
  { 
    id: '5', 
    position: { x: 250, y: 250 }, 
    data: { label: 'PRISMA' }, 
    style: { 
      border: '4px solid var(--border)', 
      background: 'var(--card)', 
      color: 'var(--card-foreground)', 
      borderRadius: 0, 
      fontWeight: 900,
      padding: '10px 18px',
      boxShadow: '4px 4px 0px 0px var(--foreground)'
    } 
  },
  { 
    id: '6', 
    position: { x: 250, y: 350 }, 
    data: { label: 'POSTGRESQL' }, 
    style: { 
      border: '4px solid var(--border)', 
      background: 'var(--color-secondary)', 
      color: '#000000', 
      borderRadius: 0, 
      fontWeight: 900,
      padding: '10px 18px',
      boxShadow: '4px 4px 0px 0px var(--foreground)'
    } 
  },
  { 
    id: '7', 
    position: { x: 450, y: 150 }, 
    data: { label: 'SOCKET.IO' }, 
    style: { 
      border: '4px solid var(--border)', 
      background: 'var(--card)', 
      color: 'var(--card-foreground)', 
      borderRadius: 0, 
      fontWeight: 900,
      padding: '10px 18px',
      boxShadow: '4px 4px 0px 0px var(--foreground)'
    } 
  },
  { 
    id: '8', 
    position: { x: 450, y: 250 }, 
    data: { label: 'INTERVIEW ENGINE' }, 
    style: { 
      border: '4px solid var(--border)', 
      background: 'var(--color-accent)', 
      color: '#ffffff', 
      borderRadius: 0, 
      fontWeight: 900,
      padding: '10px 18px',
      boxShadow: '4px 4px 0px 0px var(--foreground)'
    } 
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'straight', style: { strokeWidth: 4, stroke: 'var(--border)' }, animated: true },
  { id: 'e2-3', source: '2', target: '3', type: 'straight', style: { strokeWidth: 4, stroke: 'var(--border)' } },
  { id: 'e2-4', source: '2', target: '4', type: 'straight', style: { strokeWidth: 4, stroke: 'var(--border)' } },
  { id: 'e3-5', source: '3', target: '5', type: 'straight', style: { strokeWidth: 4, stroke: 'var(--border)' } },
  { id: 'e5-6', source: '5', target: '6', type: 'straight', style: { strokeWidth: 4, stroke: 'var(--border)' } },
  { id: 'e4-7', source: '4', target: '7', type: 'straight', style: { strokeWidth: 4, stroke: 'var(--border)' }, animated: true },
  { id: 'e7-8', source: '7', target: '8', type: 'straight', style: { strokeWidth: 4, stroke: 'var(--border)' }, animated: true },
  { id: 'e3-8', source: '3', target: '8', type: 'straight', style: { strokeWidth: 4, stroke: 'var(--border)' } },
];

export function ArchitectureDiagram() {
    return (
        <section 
            id="architecture" 
            className="w-full bg-background border-b-4 border-border relative"
            aria-label="Project Marko System Architecture Diagram"
        >
            <div className="border-b-4 border-border px-6 py-12">
                <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
                            SYSTEM ARCHITECTURE
                        </h2>
                        <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-2">
                            Event-driven multi-agent pipeline & real-time WebSocket orchestration
                        </p>
                    </div>
                </div>
            </div>
            <div className="w-full h-[450px] md:h-[600px] bg-background">
                <ReactFlow 
                    nodes={initialNodes} 
                    edges={initialEdges}
                    fitView
                    zoomOnScroll={false}
                    preventScrolling={false}
                    nodesConnectable={false}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background color="var(--foreground)" variant={BackgroundVariant.Lines} gap={50} lineWidth={2} style={{ opacity: 0.12 }} />
                    <Controls className="border-2 border-border rounded-none shadow-[4px_4px_0px_0px_var(--foreground)] bg-card text-card-foreground" />
                </ReactFlow>
            </div>
        </section>
    );
}
