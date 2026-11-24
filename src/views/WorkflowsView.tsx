import { useMemo, useState } from 'react'
import { ToolPanel } from '../components/ToolPanel'
import { FlowCanvas } from '../components/FlowCanvas'
import { FLOW_STYLE } from '../components/ui'
import { loadOverrides, saveOverrides } from '../layout/common'
import { buildWorkflowGraph } from '../layout/workflow'
import { useOrg } from '../state/OrgContext'

export function WorkflowsView() {
  const { model, selection, select } = useOrg()
  const [wid, setWid] = useState(model.workflows[0].id)
  const [overrides, setOverrides] = useState(() => loadOverrides('workflows'))
  const w = model.workflows.find((x) => x.id === wid) ?? model.workflows[0]
  const { nodes, edges } = useMemo(() => buildWorkflowGraph(w, overrides, selection), [w, overrides, selection])
  const kinds = [...new Set(w.edges.map((e) => e.kind))]

  return (
    <FlowCanvas
      viewKey={`workflows|${w.id}`}
      nodes={nodes}
      edges={edges}
      overrides={overrides}
      setOverrides={setOverrides}
      keyOf={(n) => `${w.id}:${n.id}`}
      onSelectNode={(n) => select({ kind: 'step', workflowId: w.id, id: n.id })}
      onPane={() => select(null)}
      fitPadding={{ top: '60px', right: '30px', bottom: '30px', left: '30px' }}
    >
      <ToolPanel title="Workflow" width="md:w-[420px]">
        <div>
          <select aria-label="Elegir workflow"
            id="wf"
            value={w.id}
            onChange={(e) => { setWid(e.target.value); select(null) }}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
          >
            {model.workflows.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-300">{w.description}</p>
          <p className="mt-1 text-[11px] text-slate-500"><span className="text-slate-400">Se activa cuando:</span> {w.trigger}</p>
          <p className="mt-0.5 text-[11px] text-slate-600">Fuente: {w.source}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-800 pt-2">
            {kinds.map((k) => (
              <span key={k} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="h-0.5 w-4" style={{ background: FLOW_STYLE[k].color }} />{FLOW_STYLE[k].label}
              </span>
            ))}
            <button onClick={() => { const rest = Object.fromEntries(Object.entries(overrides).filter(([k]) => !k.startsWith(`${w.id}:`))); setOverrides(rest); saveOverrides('workflows', rest) }} className="ml-auto text-[11px] text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline">Restablecer</button>
          </div>
        </div>
      </ToolPanel>
    </FlowCanvas>
  )
}
