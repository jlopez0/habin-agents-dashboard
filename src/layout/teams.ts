import type { Edge, Node } from '@xyflow/react'
import type { OrgModel, Selection } from '../domain/types'
import { NODE_H, NODE_W, edgeBase, gridPos, gridSize, pickHandles, sortParentsFirst, type Box, type Overrides } from './common'

export function buildTeamsGraph({ model, overrides, selection }: { model: OrgModel; overrides: Overrides; selection: Selection }): { nodes: Node[]; edges: Edge[] } {
  const core = model.teams.find((t) => t.kind === 'central')
  const projects = model.teams.filter((t) => t.kind === 'project')
  const nodes: Node[] = []
  const abs = new Map<string, Box>()
  const V_GAP = 110
  const H_GAP = 56

  const selTeam = selection?.kind === 'team' ? selection.id : null
  const selAgent = selection?.kind === 'agent' ? selection.id : null
  const selAgentTeams = selAgent ? model.agents.find((a) => a.id === selAgent)?.teamIds ?? [] : []
  const highlightIds = new Set<string>()
  if (selTeam) {
    model.teams.find((t) => t.id === selTeam)?.commonlyUses.forEach((id) => highlightIds.add(id))
  }

  // pool compartido
  let poolW = 0
  let poolH = 0
  if (core) {
    const cols = 4
    const sz = gridSize(core.memberIds.length, cols)
    poolW = sz.w
    poolH = sz.h
  }
  // equipos de proyecto
  const projSizes = projects.map((t) => gridSize(t.memberIds.length, 1))
  const rowW = projSizes.reduce((s, z) => s + z.w, 0) + H_GAP * (projects.length - 1)
  const totalW = Math.max(poolW, rowW)

  if (core) {
    const gid = `team:${core.id}`
    const pos = overrides[gid] ?? { x: (totalW - poolW) / 2, y: 0 }
    abs.set(gid, { ...pos, w: poolW, h: poolH })
    nodes.push({
      id: gid, type: 'area', position: pos, style: { width: poolW, height: poolH }, zIndex: 0,
      data: { name: `${core.name} · especialistas compartidos`, description: 'Disponibles para todos los equipos', tone: 'sky', count: core.memberIds.length, selected: selTeam === core.id, clickable: true, tag: `${core.memberIds.length} agentes` },
    })
    core.memberIds.forEach((id, i) => {
      const rel = overrides[id] ?? gridPos(i, 4)
      abs.set(id, { x: pos.x + rel.x, y: pos.y + rel.y, w: NODE_W, h: NODE_H })
      nodes.push({ id, type: 'agent', position: rel, parentId: gid, extent: 'parent', zIndex: 1, data: { agentId: id, selected: selAgent === id, dim: !!selTeam && !highlightIds.has(id) && selTeam !== core.id } })
    })
  }

  const y2 = poolH + V_GAP
  let x = (totalW - rowW) / 2
  projects.forEach((t, i) => {
    const sz = projSizes[i]
    const gid = `team:${t.id}`
    const pos = overrides[gid] ?? { x, y: y2 }
    abs.set(gid, { ...pos, w: sz.w, h: sz.h })
    x += sz.w + H_GAP
    nodes.push({
      id: gid, type: 'area', position: pos, style: { width: sz.w, height: sz.h }, zIndex: 0,
      data: { name: t.name, description: t.stack.split('·')[0].trim(), tone: 'emerald', count: t.memberIds.length, selected: selTeam === t.id, clickable: true, dim: !!selAgent && !selAgentTeams.includes(t.id) && !model.teams.find((q) => q.id === t.id)?.commonlyUses.includes(selAgent) },
    })
    t.memberIds.forEach((id, j) => {
      const rel = overrides[id] ?? gridPos(j, 1)
      abs.set(id, { x: pos.x + rel.x, y: pos.y + rel.y, w: NODE_W, h: NODE_H })
      nodes.push({ id, type: 'agent', position: rel, parentId: gid, extent: 'parent', zIndex: 1, data: { agentId: id, selected: selAgent === id } })
    })
  })

  const edges: Edge[] = []
  // pool → equipos (disponibilidad)
  if (core) {
    projects.forEach((t) => {
      const s = abs.get(`team:${core.id}`)!
      const d = abs.get(`team:${t.id}`)!
      edges.push(edgeBase(`pool:${t.id}`, `team:${core.id}`, `team:${t.id}`, '#475569', {
        ...pickHandles(s, d), type: 'smoothstep', label: 'disponible', style: { stroke: '#475569', strokeWidth: 1.4, strokeDasharray: '4 4' },
      }))
    })
  }
  // uso habitual: solo al seleccionar un equipo o un agente compartido
  for (const t of projects) {
    for (const id of t.commonlyUses) {
      const show = selTeam === t.id || selAgent === id
      if (!show) continue
      const s = abs.get(id)
      const d = abs.get(`team:${t.id}`)
      if (!s || !d) continue
      edges.push(edgeBase(`use:${t.id}:${id}`, id, `team:${t.id}`, '#38bdf8', { ...pickHandles(s, d), label: 'uso habitual', zIndex: 3, style: { stroke: '#38bdf8', strokeWidth: 1.8 } }))
    }
  }
  // relaciones funcionales entre agentes visibles
  const isProject = (id: string) => model.agents.find((a) => a.id === id)?.kind === 'specialist'
  for (const r of model.relations) {
    const s = abs.get(r.from)
    const d = abs.get(r.to)
    if (!s || !d) continue
    const touches = !!selAgent && (r.from === selAgent || r.to === selAgent)
    if (!isProject(r.from) && !isProject(r.to) && !touches) continue
    edges.push(edgeBase(`rel:${r.id}`, r.from, r.to, '#a78bfa', { ...pickHandles(s, d), label: r.label, zIndex: 3, style: { stroke: '#a78bfa', strokeWidth: 1.6, strokeDasharray: '7 4' } }))
  }
  return { nodes: sortParentsFirst(nodes), edges }
}
