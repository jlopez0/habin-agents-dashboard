import { useEffect, useState, type ReactNode } from 'react'
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, type Edge, type FitViewOptions, type Node, type OnNodesChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from './nodes'
import { saveOverrides, type Overrides } from '../layout/common'

interface Props {
  nodes: Node[]
  edges: Edge[]
  viewKey: string
  overrides: Overrides
  setOverrides: (o: Overrides) => void
  keyOf?: (n: Node) => string
  onSelectNode: (n: Node) => void
  onPane: () => void
  fitPadding?: FitViewOptions['padding']
  children?: ReactNode
}

const MINIMAP_COLOR: Record<string, string> = { area: '#1e293b', agent: '#38bdf8', step: '#64748b' }

/** Lienzo interactivo común: zoom, pan, arrastre de nodos con posiciones persistentes y minimapa. */
export function FlowCanvas({ nodes: built, edges, viewKey, overrides, setOverrides, keyOf, onSelectNode, onPane, fitPadding, children }: Props) {
  const [nodes, setNodes] = useState(built)
  useEffect(() => setNodes(built), [built])
  const onNodesChange: OnNodesChange = (changes) => setNodes((ns) => changes.applyTo(ns))
  return (
    <ReactFlow
      key={viewKey}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onNodeClick={(_, n) => onSelectNode(n)}
      onPaneClick={onPane}
      onNodeDragStop={(_, n) => {
        const next = { ...overrides, [keyOf ? keyOf(n) : n.id]: n.position }
        setOverrides(next)
        saveOverrides(viewKey.split('|')[0], next)
      }}
      nodesConnectable={false}
      fitView
      fitViewOptions={{ padding: fitPadding ?? 0.12 }}
      minZoom={0.15}
      maxZoom={1.8}
      forceColorMode="dark"
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#1c2638" />
      <Controls showInteractive={false} position="bottom-right" />
      <MiniMap pannable zoomable position="bottom-left" className="!hidden md:!block" nodeColor={(n) => MINIMAP_COLOR[n.type ?? 'agent']} maskColor="rgba(5,8,14,0.7)" />
      {children}
    </ReactFlow>
  )
}
