import { OrgProvider, useOrg } from './state/OrgContext'
import { useHashRoute, type Route } from './hooks/useHashRoute'
import { DetailPanel } from './components/DetailPanel'
import { ALL_STATUSES, STATUS_META } from './domain/status'
import { StatusDot } from './components/StatusBadge'
import { OrganizationView } from './views/OrganizationView'
import { TeamsView } from './views/TeamsView'
import { WorkflowsView } from './views/WorkflowsView'

const NAV: { id: Route; label: string; hint: string }[] = [
  { id: 'organization', label: 'Organization', hint: 'Organigrama y jerarquías' },
  { id: 'teams', label: 'Teams', hint: 'Equipos y compartidos' },
  { id: 'workflows', label: 'Workflows', hint: 'Delegación y revisión' },
]

function Shell() {
  const [route, go] = useHashRoute()
  const { model, live, preview, setPreview, sourceName, select } = useOrg()
  return (
    <div className="flex h-full flex-col md:flex-row">
      <nav className="flex shrink-0 items-center gap-1 border-b border-slate-800 bg-[#0a0e16] px-3 py-2 md:w-60 md:flex-col md:items-stretch md:gap-0 md:border-b-0 md:border-r md:px-4 md:py-5">
        <div className="mr-2 flex items-center gap-2.5 md:mb-6 md:mr-0">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 text-sm font-bold text-slate-950">h</div>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-semibold text-slate-100">habin-agents</div>
            <div className="text-[11px] text-slate-500">Panel de organización</div>
          </div>
        </div>
        <div className="flex flex-1 gap-1 md:flex-none md:flex-col">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => { select(null); go(n.id) }}
              className={`rounded-lg px-3 py-2 text-left transition md:py-2.5 ${route === n.id ? 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <div className="text-sm font-medium">{n.label}</div>
              <div className="hidden text-[11px] text-slate-500 md:block">{n.hint}</div>
            </button>
          ))}
        </div>
        <div className="hidden space-y-3 md:block">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400">
            <div className="mb-2 flex items-center gap-2 font-medium text-slate-300">
              <span className={`h-2 w-2 rounded-full ${live ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              {preview ? 'Vista previa de estados' : live ? 'En vivo' : 'Sin conexión al orquestador'}
            </div>
            <div className="grid gap-1">
              {ALL_STATUSES.map((s) => <div key={s} className="flex items-center gap-2"><StatusDot status={s} /><span className={STATUS_META[s].text}>{STATUS_META[s].label}</span></div>)}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-400">
            <input type="checkbox" checked={preview} onChange={(e) => setPreview(e.target.checked)} className="accent-sky-500" />
            Previsualizar estados (solo diseño)
          </label>
          <div className="text-[10px] text-slate-600">{model.agents.length} agentes · {model.workflows.length} workflows · datos: {sourceName}</div>
        </div>
      </nav>
      <main className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          {route === 'organization' && <OrganizationView />}
          {route === 'teams' && <TeamsView />}
          {route === 'workflows' && <WorkflowsView />}
        </div>
        <DetailPanel />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <OrgProvider>
      <Shell />
    </OrgProvider>
  )
}
