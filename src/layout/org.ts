import type { Edge, Node } from '@xyflow/react'
import type { OrgModel, RelationKind, Selection } from '../domain/types'
import { NODE_H, NODE_W, edgeBase, gridPos, gridSize, pickHandles, sortParentsFirst, type Box, type Overrides } from './common'
import { RELATION_STYLE } from '../components/ui'

interface Args {
  model: OrgModel
  overrides: Overrides
  selection: Selection
  enabledKinds: Set<RelationKind>
}

const ROW1 = ['architecture', 'execution', 'quality', 'business']
const ROW2 = ['paddock', 'parrotrip', 'personal-dashboard']
const H_GAP = 56
const V_GAP = 90

export function buildOrgGraph({ model, overrides, selection, enabledKinds }: Args): { nodes: Node[]; edges: Edge[] } {
  const membersOf = (areaId: string) => model.agents.filter((a) => a.areaId === areaId)
  const colsFor = (n: number) => (n >= 4 ? 2 : 1)

  // --- tamaños y posición base de cada grupo
  const sizes = new Map<string, { w: number; h: number; cols: number }>()
  for (const area of model.areas) {
    const n = membersOf(area.id).length
    const cols = colsFor(n)
    sizes.set(area.id, { ...gridSize(n, cols), cols })
  }
  const base = new Map<string, { x: number; y: number }>()
  const rowWidth = (ids: string[]) => ids.reduce((s, id) => s + sizes.get(id)!.w, 0) + H_GAP * (ids.length - 1)
  const rowHeight = (ids: string[]) => Math.max(...ids.map((id) => sizes.get(id)!.h))
  const w1 = rowWidth(ROW1)
  const dir = sizes.get('direction')!
  base.set('direction', { x: (w1 - dir.w) / 2, y: 0 })
  const y1 = dir.h + V_GAP
  let x = 0
  for (const id of ROW1) { base.set(id, { x, y: y1 }); x += sizes.get(id)!.w + H_GAP }
  const y2 = y1 + rowHeight(ROW1) + V_GAP
  x = (w1 - rowWidth(ROW2)) / 2
  for (const id of ROW2) { base.set(id, { x, y: y2 }); x += sizes.get(id)!.w + H_GAP }

  // --- relaciones activas respecto a la selección
  const sel = selection?.kind === 'agent' ? selection.id : null
  const related = new Set<string>()
  if (sel) {
    related.add(sel)
    const me = model.agents.find((a) => a.id === sel)
    if (me?.reportsTo) related.add(me.reportsTo)
    model.agents.filter((a) => a.reportsTo === sel).forEach((a) => related.add(a.id))
    model.relations.filter((r) => r.from === sel || r.to === sel).forEach((r) => { related.add(r.from); related.add(r.to) })
  }

  // --- nodos
  const nodes: Node[] = []
  const abs = new Map<string, Box>()
  for (const area of model.areas) {
    const members = membersOf(area.id)
    const sz = sizes.get(area.id)!
    const gid = `area:${area.id}`
    const pos = overrides[gid] ?? base.get(area.id) ?? { x: 0, y: 0 }
    abs.set(gid, { ...pos, w: sz.w, h: sz.h })
    const areaDim = !!sel && !members.some((m) => related.has(m.id))
    nodes.push({
      id: gid, type: 'area', position: pos, style: { width: sz.w, height: sz.h }, zIndex: 0,
      data: { name: area.name, description: area.description, tone: area.tone, count: members.length, dim: areaDim },
    })
    members.forEach((m, i) => {
      const rel = overrides[m.id] ?? gridPos(i, sz.cols)
      abs.set(m.id, { x: pos.x + rel.x, y: pos.y + rel.y, w: NODE_W, h: NODE_H })
      nodes.push({
        id: m.id, type: 'agent', position: rel, parentId: gid, extent: 'parent', zIndex: 1,
        data: { agentId: m.id, dim: !!sel && !related.has(m.id), selected: sel === m.id },
      })
    })
  }

  // --- aristas de jerarquía (agente→agente en la misma área; si no, agente→grupo)
  const edges: Edge[] = []
  const seen = new Set<string>()
  const hier = '#64748b'
  for (const a of model.agents) {
    if (!a.reportsTo) continue
    const boss = model.agents.find((b) => b.id === a.reportsTo)
    if (!boss) continue
    const sameArea = boss.areaId === a.areaId
    const targetId = sameArea ? a.id : `area:${a.areaId}`
    const key = `${boss.id}>${targetId}`
    if (seen.has(key)) continue
    seen.add(key)
    const handles = { sourceHandle: 'bottom-s', targetHandle: 'top-t' }
    const hot = !!sel && (a.id === sel || boss.id === sel)
    edges.push(edgeBase(`h:${key}`, boss.id, targetId, hot ? '#38bdf8' : hier, {
      ...handles, type: 'smoothstep', zIndex: hot ? 2 : -1,
      style: { stroke: hot ? '#38bdf8' : hier, strokeWidth: hot ? 2.2 : 1.6, opacity: sel && !hot ? 0.2 : 0.75 },
    }))
  }

  // --- relaciones funcionales (visibles por tipo o si tocan al agente seleccionado)
  for (const r of model.relations) {
    const touches = !!sel && (r.from === sel || r.to === sel)
    if (!enabledKinds.has(r.kind) && !touches) continue
    const s = abs.get(r.from)
    const t = abs.get(r.to)
    if (!s || !t) continue
    const color = RELATION_STYLE[r.kind].color
    edges.push(edgeBase(`r:${r.id}`, r.from, r.to, color, {
      ...pickHandles(s, t), type: 'default', label: r.label, animated: r.kind === 'escalation', zIndex: 3,
      style: { stroke: color, strokeWidth: 1.8, strokeDasharray: '7 4' },
    }))
  }

  return { nodes: sortParentsFirst(nodes), edges }
}
