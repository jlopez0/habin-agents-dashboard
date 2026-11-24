import type { AgentKind, AreaTone, FlowEdgeKind, ModelTier, RelationKind } from '../domain/types'

export const ACCENT_HEX: Record<string, string> = {
  purple: '#a78bfa', blue: '#60a5fa', gray: '#94a3b8', green: '#4ade80', cyan: '#22d3ee',
  orange: '#fb923c', red: '#f87171', pink: '#f472b6', yellow: '#facc15',
}
export const accentOf = (a?: string) => ACCENT_HEX[a ?? ''] ?? '#94a3b8'

export const TONE: Record<AreaTone, { border: string; bg: string; text: string; chip: string; hex: string }> = {
  amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/[0.04]', text: 'text-amber-300', chip: 'bg-amber-500/15 text-amber-300', hex: '#f59e0b' },
  violet: { border: 'border-violet-500/30', bg: 'bg-violet-500/[0.04]', text: 'text-violet-300', chip: 'bg-violet-500/15 text-violet-300', hex: '#8b5cf6' },
  sky: { border: 'border-sky-500/30', bg: 'bg-sky-500/[0.04]', text: 'text-sky-300', chip: 'bg-sky-500/15 text-sky-300', hex: '#0ea5e9' },
  orange: { border: 'border-orange-500/30', bg: 'bg-orange-500/[0.04]', text: 'text-orange-300', chip: 'bg-orange-500/15 text-orange-300', hex: '#f97316' },
  cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/[0.04]', text: 'text-cyan-300', chip: 'bg-cyan-500/15 text-cyan-300', hex: '#06b6d4' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/[0.04]', text: 'text-emerald-300', chip: 'bg-emerald-500/15 text-emerald-300', hex: '#10b981' },
}

export const KIND: Record<AgentKind, { label: string; card: string; badge: string }> = {
  human: { label: 'Dirección', card: 'border-amber-400/60 bg-gradient-to-b from-amber-950/60 to-slate-900 rounded-3xl', badge: 'bg-amber-400/15 text-amber-300' },
  coordinator: { label: 'Coordinador', card: 'border-rose-400/70 bg-gradient-to-b from-rose-950/50 to-slate-900 shadow-[0_0_24px_-6px_rgba(244,63,94,0.55)] rounded-2xl', badge: 'bg-rose-400/15 text-rose-300' },
  core: { label: 'Equipo central', card: 'border-sky-500/40 bg-slate-900/95 rounded-xl', badge: 'bg-sky-500/15 text-sky-300' },
  specialist: { label: 'Especialista', card: 'border-emerald-500/40 bg-slate-900/95 rounded-xl border-l-4', badge: 'bg-emerald-500/15 text-emerald-300' },
  builtin: { label: 'Integrado', card: 'border-slate-500/50 border-dashed bg-slate-900/70 rounded-xl', badge: 'bg-slate-500/20 text-slate-300' },
}

export const MODEL_LABEL: Record<ModelTier, string> = { opus: 'Opus', sonnet: 'Sonnet', haiku: 'Haiku' }
export const MODEL_CHIP: Record<ModelTier, string> = {
  opus: 'bg-violet-500/15 text-violet-300',
  sonnet: 'bg-sky-500/15 text-sky-300',
  haiku: 'bg-teal-500/15 text-teal-300',
}
export const EFFORT_LABEL = { low: 'bajo', medium: 'medio', high: 'alto' } as const

export const RELATION_STYLE: Record<RelationKind, { label: string; color: string }> = {
  handoff: { label: 'Traspaso', color: '#38bdf8' },
  escalation: { label: 'Escalado', color: '#fb7185' },
  review: { label: 'Revisión', color: '#fb923c' },
  request: { label: 'Petición', color: '#a78bfa' },
  approval: { label: 'Aprobación', color: '#fbbf24' },
}
export const FLOW_STYLE: Record<FlowEdgeKind, { label: string; color: string; dash?: string }> = {
  flow: { label: 'Flujo', color: '#64748b' },
  delegation: { label: 'Delegación', color: '#38bdf8' },
  review: { label: 'Revisión', color: '#fb923c' },
  approval: { label: 'Aprobación', color: '#34d399' },
  loop: { label: 'Reintento', color: '#a78bfa', dash: '6 4' },
  escalation: { label: 'Escalado', color: '#fb7185', dash: '6 4' },
}

export const AUTONOMY_LABEL = ['Solo lectura', 'Acotado', 'Ejecuta tareas', 'Coordina'] as const
