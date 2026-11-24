import type { AgentTask } from '../domain/types'
import { ALL_STATUSES, type AgentStatus } from '../domain/status'

export interface AgentRuntime {
  status: AgentStatus
  since?: string
  tasks?: AgentTask[]
}
export type RuntimeSnapshot = Record<string, AgentRuntime>

/**
 * Contrato del estado en vivo. El futuro backend de orquestación lo implementará
 * (SSE / WebSocket) y emitirá snapshots completos o parciales.
 */
export interface RuntimeSource {
  readonly name: string
  readonly live: boolean
  subscribe(onSnapshot: (s: RuntimeSnapshot) => void): () => void
}

/** Sin backend: no emite estados, la UI muestra «sin datos». */
export const nullRuntime: RuntimeSource = {
  name: 'none',
  live: false,
  subscribe(cb) {
    cb({})
    return () => {}
  },
}

/** Solo para previsualizar el diseño de estados en local. No simula ejecución de agentes. */
export function previewSnapshot(agentIds: string[]): RuntimeSnapshot {
  const out: RuntimeSnapshot = {}
  agentIds.forEach((id, i) => {
    if (id === 'javier') return
    out[id] = { status: ALL_STATUSES.filter((s) => s !== 'OFFLINE')[i % 5] }
  })
  return out
}
