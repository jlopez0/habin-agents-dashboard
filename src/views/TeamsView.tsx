import { useMemo, useState } from 'react'
import { ToolPanel } from '../components/ToolPanel'
import { FlowCanvas } from '../components/FlowCanvas'
import { loadOverrides, saveOverrides } from '../layout/common'
import { buildTeamsGraph } from '../layout/teams'
import { useOrg } from '../state/OrgContext'

export function TeamsView() {
  const { model, selection, select } = useOrg()
  const [overrides, setOverrides] = useState(() => loadOverrides('teams'))
  const { nodes, edges } = useMemo(() => buildTeamsGraph({ model, overrides, selection }), [model, overrides, selection])
  return (
    <FlowCanvas
      viewKey="teams"
      nodes={nodes}
      edges={edges}
      overrides={overrides}
      setOverrides={setOverrides}
      onSelectNode={(n) => {
        if (n.type === 'agent') select({ kind: 'agent', id: n.id })
        else if (n.id.startsWith('team:')) select({ kind: 'team', id: n.id.slice(5) })
      }}
      onPane={() => select(null)}
      fitPadding={{ top: '210px', right: '30px', bottom: '30px', left: '30px' }}
    >
      <ToolPanel title="Cómo leer este mapa" width="md:max-w-sm">
        <div className="text-[12px] leading-relaxed text-slate-400">
          <p><span className="font-medium text-slate-200">Especialistas compartidos</span> (arriba) sirven a todos los proyectos; cada equipo tiene además sus propios especialistas.</p>
          <p className="mt-1">Pulsa un equipo para ver sus integrantes y el <span className="text-sky-300">uso habitual</span> de agentes compartidos, o pulsa un agente compartido para ver en qué equipos se usa.</p>
          <button onClick={() => { setOverrides({}); saveOverrides('teams', {}) }} className="mt-2 text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline">Restablecer disposición</button>
        </div>
      </ToolPanel>
    </FlowCanvas>
  )
}
