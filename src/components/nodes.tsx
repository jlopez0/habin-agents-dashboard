import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useOrg } from '../state/OrgContext'
import { StatusDot } from './StatusBadge'
import { EFFORT_LABEL, KIND, MODEL_CHIP, MODEL_LABEL, TONE, accentOf } from './ui'
import type { AreaTone, StepType } from '../domain/types'

/** Cuatro lados × (source, target) para poder conectar en cualquier dirección. */
export function AllHandles() {
  const sides: [Position, string][] = [[Position.Top, 'top'], [Position.Bottom, 'bottom'], [Position.Left, 'left'], [Position.Right, 'right']]
  return (
    <>
      {sides.map(([pos, name]) => (
        <span key={name}>
          <Handle id={`${name}-s`} type="source" position={pos} className="!h-1.5 !w-1.5 !border-0 !bg-transparent" />
          <Handle id={`${name}-t`} type="target" position={pos} className="!h-1.5 !w-1.5 !border-0 !bg-transparent" />
        </span>
      ))}
    </>
  )
}

export type AgentNodeData = { agentId: string; dim?: boolean; selected?: boolean; showTeams?: boolean }

export function AgentNode({ data }: NodeProps) {
  const d = data as AgentNodeData
  const { agentById, statusOf } = useOrg()
  const a = agentById(d.agentId)
  if (!a) return null
  const k = KIND[a.kind]
  const initials = a.name.slice(0, 2).toUpperCase()
  const accent = accentOf(a.accent)
  return (
    <div
      className={`w-[248px] cursor-pointer border p-3 transition-all hover:-translate-y-0.5 ${k.card} ${d.selected ? 'ring-2 ring-sky-400' : ''} ${d.dim ? 'opacity-40' : ''}`}
    >
      <AllHandles />
      <div className="flex items-center gap-2.5">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center text-[11px] font-bold ${a.kind === 'human' ? 'rounded-full' : 'rounded-lg'}`}
          style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}55` }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-slate-100">{a.name}</span>
            <StatusDot status={statusOf(a.id)} />
          </div>
          <div className="truncate text-[11px] text-slate-400">{a.role}</div>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 min-h-[2rem] text-[11px] leading-snug text-slate-400">{a.summary}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${k.badge}`}>{k.label}</span>
        {a.model && (
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${MODEL_CHIP[a.model]}`}>
            {MODEL_LABEL[a.model]}{a.effort ? ` · ${EFFORT_LABEL[a.effort]}` : ''}
          </span>
        )}
      </div>
    </div>
  )
}

export type AreaNodeData = { name: string; description: string; tone: AreaTone; count: number; selected?: boolean; clickable?: boolean; dim?: boolean; tag?: string }

export function AreaNode({ data }: NodeProps) {
  const d = data as AreaNodeData
  const t = TONE[d.tone]
  return (
    <div className={`h-full w-full rounded-2xl border ${t.border} ${t.bg} ${d.selected ? 'ring-2 ring-sky-400' : ''} ${d.dim ? 'opacity-50' : ''} ${d.clickable ? 'cursor-pointer' : ''}`}>
      <AllHandles />
      <div className="flex items-center justify-between px-4 pt-3">
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wide ${t.text}`}>{d.name}</div>
          <div className="text-[11px] text-slate-500">{d.description}</div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.chip}`}>{d.tag ?? `${d.count} ${d.count === 1 ? 'agente' : 'agentes'}`}</span>
      </div>
    </div>
  )
}

export type StepNodeData = { type: StepType; label: string; agentId?: string; detail?: string; selected?: boolean }

export function StepNode({ data }: NodeProps) {
  const d = data as StepNodeData
  const { agentById, statusOf } = useOrg()
  const agent = d.agentId ? agentById(d.agentId) : undefined
  const sel = d.selected ? 'ring-2 ring-sky-400' : ''
  if (d.type === 'start' || d.type === 'end') {
    return (
      <div className={`cursor-pointer rounded-full border px-4 py-2 text-center text-xs font-semibold ${sel} ${d.type === 'start' ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-300' : 'border-slate-500/60 bg-slate-800 text-slate-300'}`} style={{ width: 200 }}>
        <AllHandles />
        {d.type === 'start' ? '▶ ' : '■ '}{d.label}
      </div>
    )
  }
  if (d.type === 'decision') {
    return (
      <div className={`grid cursor-pointer place-items-center ${sel}`} style={{ width: 200, height: 76 }}>
        <AllHandles />
        <div className="w-full rounded-lg border border-violet-400/60 bg-violet-500/10 px-3 py-2 text-center text-xs font-semibold text-violet-200" style={{ clipPath: 'polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%)' }}>
          {d.label}
        </div>
      </div>
    )
  }
  if (d.type === 'human') {
    return (
      <div className={`cursor-pointer rounded-2xl border border-amber-400/60 bg-amber-500/10 p-3 ${sel}`} style={{ width: 200 }}>
        <AllHandles />
        <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-300">Javier · aprobación</div>
        <div className="mt-0.5 text-sm font-medium text-slate-100">{d.label}</div>
      </div>
    )
  }
  const k = agent ? KIND[agent.kind] : KIND.core
  const accent = accentOf(agent?.accent)
  return (
    <div className={`cursor-pointer border p-3 ${k.card} ${sel}`} style={{ width: 200, borderLeft: `4px solid ${accent}` }}>
      <AllHandles />
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-semibold" style={{ color: accent }}>@{agent?.name ?? d.agentId}</span>
        {agent && <StatusDot status={statusOf(agent.id)} />}
      </div>
      <div className="mt-0.5 text-sm font-medium leading-snug text-slate-100">{d.label}</div>
      {agent?.model && <div className={`mt-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${MODEL_CHIP[agent.model]}`}>{MODEL_LABEL[agent.model]}</div>}
    </div>
  )
}

export const nodeTypes = { agent: AgentNode, area: AreaNode, step: StepNode }
