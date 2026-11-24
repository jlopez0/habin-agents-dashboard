import { STATUS_META, type AgentStatus } from '../domain/status'

export function StatusDot({ status, className = '' }: { status: AgentStatus; className?: string }) {
  return <span title={STATUS_META[status].hint} className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_META[status].dot} ${className}`} />
}

export function StatusBadge({ status }: { status: AgentStatus }) {
  const m = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900 px-2 py-0.5 text-[11px] font-medium ${m.text}`} title={m.hint}>
      <StatusDot status={status} />
      {m.label}
    </span>
  )
}
