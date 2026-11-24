import type { Edge, Node } from '@xyflow/react'
import type { Selection, StepType, Workflow } from '../domain/types'
import { edgeBase, pickHandles, type Box, type Overrides } from './common'
import { FLOW_STYLE } from '../components/ui'

const W = 200
const HEIGHT: Record<StepType, number> = { start: 40, end: 40, decision: 76, human: 70, agent: 92 }
const COL = 290
const ROW = 140
const PER_BAND = 6
const BAND_GAP = 120

/** Capas de izquierda a derecha por camino más largo, ignorando las aristas de reintento. */
function layers(w: Workflow): Map<string, number> {
  const layer = new Map<string, number>(w.steps.map((s) => [s.id, 0]))
  const fwd = w.edges.filter((e) => !e.loop)
  for (let i = 0; i < w.steps.length; i++) {
    let changed = false
    for (const e of fwd) {
      const next = (layer.get(e.from) ?? 0) + 1
      if (next > (layer.get(e.to) ?? 0)) { layer.set(e.to, next); changed = true }
    }
    if (!changed) break
  }
  return layer
}

export function buildWorkflowGraph(w: Workflow, overrides: Overrides, selection: Selection): { nodes: Node[]; edges: Edge[] } {
  const layer = layers(w)
  const byLayer = new Map<number, string[]>()
  for (const s of w.steps) {
    const l = layer.get(s.id) ?? 0
    byLayer.set(l, [...(byLayer.get(l) ?? []), s.id])
  }
  const abs = new Map<string, Box>()
  const maxRows = Math.max(...[...byLayer.values()].map((c) => c.length))
  const bandH = maxRows * ROW + BAND_GAP
  const nodes: Node[] = w.steps.map((s) => {
    const l = layer.get(s.id) ?? 0
    const col = byLayer.get(l)!
    const idx = col.indexOf(s.id)
    const h = HEIGHT[s.type]
    const key = `${w.id}:${s.id}`
    const band = Math.floor(l / PER_BAND)
    const pos = overrides[key] ?? { x: (band % 2 === 0 ? l % PER_BAND : PER_BAND - 1 - (l % PER_BAND)) * COL, y: band * bandH + (idx - (col.length - 1) / 2) * ROW - h / 2 }
    abs.set(s.id, { ...pos, w: W, h })
    return {
      id: s.id, type: 'step', position: pos,
      data: { type: s.type, label: s.label, agentId: s.agentId, detail: s.detail, selected: selection?.kind === 'step' && selection.workflowId === w.id && selection.id === s.id },
    }
  })
  const edges: Edge[] = w.edges.map((e, i) => {
    const st = FLOW_STYLE[e.kind]
    const a = abs.get(e.from)!
    const b = abs.get(e.to)!
    const sameBand = Math.abs(a.y - b.y) < ROW
    const handles = e.loop && sameBand ? { sourceHandle: 'bottom-s', targetHandle: 'bottom-t' } : pickHandles(a, b)
    return edgeBase(`${w.id}:${i}`, e.from, e.to, st.color, {
      ...handles, type: e.loop && sameBand ? 'default' : 'smoothstep', label: e.label, animated: e.kind === 'escalation' || e.kind === 'loop',
      style: { stroke: st.color, strokeWidth: 1.8, strokeDasharray: st.dash },
    })
  })
  return { nodes, edges }
}
