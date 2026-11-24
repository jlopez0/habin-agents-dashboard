import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dataSource } from '../data'
import { validateModel } from '../data/validate'
import type { Agent, OrgModel, Selection } from '../domain/types'
import type { AgentStatus } from '../domain/status'
import { nullRuntime, previewSnapshot, type RuntimeSnapshot, type RuntimeSource } from '../runtime/runtime'

interface Ctx {
  model: OrgModel
  agentById: (id: string) => Agent | undefined
  subordinates: (id: string) => Agent[]
  statusOf: (id: string) => AgentStatus
  tasksOf: (id: string) => NonNullable<RuntimeSnapshot[string]['tasks']>
  selection: Selection
  select: (s: Selection) => void
  live: boolean
  sourceName: string
  preview: boolean
  setPreview: (v: boolean) => void
}

const OrgCtx = createContext<Ctx | null>(null)

export function useOrg(): Ctx {
  const c = useContext(OrgCtx)
  if (!c) throw new Error('useOrg fuera de OrgProvider')
  return c
}

export function OrgProvider({ children, runtime = nullRuntime }: { children: ReactNode; runtime?: RuntimeSource }) {
  const [model, setModel] = useState<OrgModel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selection, select] = useState<Selection>(null)
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>({})
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    dataSource
      .load()
      .then((m) => {
        const issues = validateModel(m)
        if (issues.length) console.warn('[config] problemas de integridad:\n' + issues.join('\n'))
        setModel(m)
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  useEffect(() => runtime.subscribe(setSnapshot), [runtime])

  const value = useMemo<Ctx | null>(() => {
    if (!model) return null
    const byId = new Map(model.agents.map((a) => [a.id, a]))
    const effective = preview ? previewSnapshot(model.agents.map((a) => a.id)) : snapshot
    return {
      model,
      agentById: (id) => byId.get(id),
      subordinates: (id) => model.agents.filter((a) => a.reportsTo === id),
      statusOf: (id) => effective[id]?.status ?? 'OFFLINE',
      tasksOf: (id) => effective[id]?.tasks ?? byId.get(id)?.currentTasks ?? [],
      selection,
      select,
      live: runtime.live || preview,
      sourceName: dataSource.name,
      preview,
      setPreview,
    }
  }, [model, snapshot, selection, preview, runtime])

  if (error) return <div className="p-8 text-rose-300">No se pudo cargar la organización: {error}</div>
  if (!value) return <div className="p-8 text-slate-400">Cargando organización…</div>
  return <OrgCtx.Provider value={value}>{children}</OrgCtx.Provider>
}
