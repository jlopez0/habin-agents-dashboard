import { MarkerType, type Edge, type Node } from '@xyflow/react'

export const NODE_W = 248
export const NODE_H = 132
export const GAP = 16
export const HEADER = 64

export interface Pos { x: number; y: number }
export interface Box extends Pos { w: number; h: number }
export type Overrides = Record<string, Pos>

export function gridSize(n: number, cols: number) {
  const rows = Math.max(1, Math.ceil(n / cols))
  return { w: cols * NODE_W + (cols + 1) * GAP, h: HEADER + rows * (NODE_H + GAP) + GAP / 2 }
}
export function gridPos(i: number, cols: number): Pos {
  return { x: GAP + (i % cols) * (NODE_W + GAP), y: HEADER + Math.floor(i / cols) * (NODE_H + GAP) }
}

/** Elige los lados de salida y entrada según la posición relativa. */
export function pickHandles(a: Box, b: Box): { sourceHandle: string; targetHandle: string } {
  const dx = b.x + b.w / 2 - (a.x + a.w / 2)
  const dy = b.y + b.h / 2 - (a.y + a.h / 2)
  if (Math.abs(dy) >= Math.abs(dx) * 0.6) {
    return dy >= 0 ? { sourceHandle: 'bottom-s', targetHandle: 'top-t' } : { sourceHandle: 'top-s', targetHandle: 'bottom-t' }
  }
  return dx >= 0 ? { sourceHandle: 'right-s', targetHandle: 'left-t' } : { sourceHandle: 'left-s', targetHandle: 'right-t' }
}

export function arrow(color: string) {
  return { type: MarkerType.ArrowClosed, color, width: 16, height: 16 } as const
}

export function edgeBase(id: string, source: string, target: string, color: string, extra: Partial<Edge> = {}): Edge {
  return {
    id, source, target,
    interactionWidth: 0,
    selectable: false,
    focusable: false,
    markerEnd: arrow(color),
    style: { stroke: color, strokeWidth: 1.6 },
    labelStyle: { fill: '#cbd5e1', fontSize: 10, fontWeight: 500 },
    labelBgStyle: { fill: '#0b0f17', fillOpacity: 0.92 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 4,
    ...extra,
  }
}

const KEY = 'habin-dashboard:positions:v1:'
export function loadOverrides(view: string): Overrides {
  try { return JSON.parse(localStorage.getItem(KEY + view) ?? '{}') as Overrides } catch { return {} }
}
export function saveOverrides(view: string, o: Overrides) {
  try { localStorage.setItem(KEY + view, JSON.stringify(o)) } catch { /* sin almacenamiento */ }
}

export function sortParentsFirst(nodes: Node[]): Node[] {
  return [...nodes.filter((n) => !n.parentId), ...nodes.filter((n) => n.parentId)]
}
