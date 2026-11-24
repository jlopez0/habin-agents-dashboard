import { useMemo, useState } from 'react'
import { ToolPanel } from '../components/ToolPanel'
import { FlowCanvas } from '../components/FlowCanvas'
import { KIND, RELATION_STYLE } from '../components/ui'
import { loadOverrides, saveOverrides } from '../layout/common'
import { buildOrgGraph } from '../layout/org'
import { useOrg } from '../state/OrgContext'
import type { RelationKind } from '../domain/types'

export function OrganizationView() {
  const { model, selection, select } = useOrg()
  const [overrides, setOverrides] = useState(() => loadOverrides('org'))
  const [kinds, setKinds] = useState<Set<RelationKind>>(new Set())
  const { nodes, edges } = useMemo(() => buildOrgGraph({ model, overrides, selection, enabledKinds: kinds }), [model, overrides, selection, kinds])

  const toggle = (k: RelationKind) => setKinds((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n })
  const allOn = kinds.size === Object.keys(RELATION_STYLE).length

  return (
    <FlowCanvas
      viewKey="org"
      nodes={nodes}
      edges={edges}
      overrides={overrides}
      setOverrides={setOverrides}
      onSelectNode={(n) => (n.type === 'agent' ? select({ kind: 'agent', id: n.id }) : undefined)}
      onPane={() => select(null)}
    >
      <ToolPanel title="Relaciones funcionales">
        <div>
          <div className="mb-2 flex justify-end">
            <button onClick={() => setKinds(allOn ? new Set() : new Set(Object.keys(RELATION_STYLE) as RelationKind[]))} className="text-[11px] text-sky-300 hover:underline">{allOn ? 'Ocultar' : 'Mostrar todas'}</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(RELATION_STYLE) as RelationKind[]).map((k) => (
              <button key={k} onClick={() => toggle(k)} className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition ${kinds.has(k) ? 'border-slate-500 bg-slate-800 text-slate-100' : 'border-slate-800 text-slate-500 hover:text-slate-300'}`}>
                <span className="h-0.5 w-4" style={{ background: RELATION_STYLE[k].color }} />
                {RELATION_STYLE[k].label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-800 pt-2 text-[11px] text-slate-400">
            {Object.values(KIND).map((k) => <span key={k.label} className={`rounded px-1.5 py-0.5 ${k.badge}`}>{k.label}</span>)}
            <button onClick={() => { setOverrides({}); saveOverrides('org', {}) }} className="ml-auto text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline">Restablecer disposición</button>
          </div>
        </div>
      </ToolPanel>
    </FlowCanvas>
  )
}
