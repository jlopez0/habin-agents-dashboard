export type AgentStatus = 'IDLE' | 'WORKING' | 'REVIEW' | 'BLOCKED' | 'ERROR' | 'OFFLINE'

export const STATUS_META: Record<AgentStatus, { label: string; dot: string; text: string; ring: string; hint: string }> = {
  IDLE: { label: 'IDLE', dot: 'bg-slate-400', text: 'text-slate-300', ring: 'ring-slate-500/40', hint: 'Disponible, sin tarea' },
  WORKING: { label: 'WORKING', dot: 'bg-emerald-400 animate-pulse', text: 'text-emerald-300', ring: 'ring-emerald-400/50', hint: 'Ejecutando una tarea' },
  REVIEW: { label: 'REVIEW', dot: 'bg-sky-400', text: 'text-sky-300', ring: 'ring-sky-400/50', hint: 'Esperando o haciendo revisión' },
  BLOCKED: { label: 'BLOCKED', dot: 'bg-amber-400', text: 'text-amber-300', ring: 'ring-amber-400/50', hint: 'Bloqueado: necesita a Javier o a otro agente' },
  ERROR: { label: 'ERROR', dot: 'bg-rose-500', text: 'text-rose-300', ring: 'ring-rose-500/60', hint: 'Fallo en la última ejecución' },
  OFFLINE: { label: 'SIN DATOS', dot: 'bg-slate-700 ring-1 ring-slate-500', text: 'text-slate-500', ring: 'ring-transparent', hint: 'Sin conexión con el orquestador (datos estáticos)' },
}

export const ALL_STATUSES = Object.keys(STATUS_META) as AgentStatus[]
