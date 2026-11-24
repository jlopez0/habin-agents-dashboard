import type { ReactNode } from 'react'
import { useOrg } from '../state/OrgContext'
import { StatusBadge } from './StatusBadge'
import { AUTONOMY_LABEL, EFFORT_LABEL, KIND, MODEL_CHIP, MODEL_LABEL, accentOf } from './ui'
import type { Agent, CommitPolicy } from '../domain/types'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-800 px-5 py-4">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      {children}
    </section>
  )
}
const Bullets = ({ items }: { items: string[] }) =>
  items.length === 0 ? <p className="text-sm text-slate-500">—</p> : (
    <ul className="space-y-1.5 text-sm text-slate-300">
      {items.map((t) => (
        <li key={t} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" /><span>{t}</span></li>
      ))}
    </ul>
  )
const Chip = ({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'rose' }) => (
  <span className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${tone === 'rose' ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 line-through decoration-rose-400/60' : 'border-slate-700 bg-slate-800/70 text-slate-300'}`}>{children}</span>
)
const COMMIT: Record<CommitPolicy, string> = { si: 'Sí (un commit por fase)', no: 'No', 'bajo-peticion': 'Solo si se lo piden', 'no-definido': 'No definido en su agente' }

function AgentLink({ a, onClick }: { a: Agent; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-left hover:border-slate-600">
      <span className="h-2 w-2 rounded-full" style={{ background: accentOf(a.accent) }} />
      <span className="text-sm font-medium text-slate-200">{a.name}</span>
      <span className="truncate text-xs text-slate-500">{a.role}</span>
    </button>
  )
}

function AgentDetail({ id }: { id: string }) {
  const { agentById, subordinates, statusOf, tasksOf, live, select, model } = useOrg()
  const a = agentById(id)
  if (!a) return null
  const boss = a.reportsTo ? agentById(a.reportsTo) : undefined
  const subs = subordinates(a.id)
  const rels = model.relations.filter((r) => r.from === a.id || r.to === a.id)
  const tasks = tasksOf(a.id)
  const k = KIND[a.kind]
  const area = model.areas.find((x) => x.id === a.areaId)
  const teams = model.teams.filter((t) => a.teamIds.includes(t.id))
  const usedBy = model.teams.filter((t) => t.commonlyUses.includes(a.id))
  return (
    <>
      <header className="px-5 pb-4 pt-5">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-bold" style={{ background: `${accentOf(a.accent)}22`, color: accentOf(a.accent), border: `1px solid ${accentOf(a.accent)}55` }}>
            {a.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-50">{a.name}</h2>
            <p className="text-sm text-slate-400">{a.role}</p>
          </div>
          <StatusBadge status={statusOf(a.id)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${k.badge}`}>{k.label}</span>
          {area && <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">{area.name}</span>}
          {a.model && <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${MODEL_CHIP[a.model]}`}>{MODEL_LABEL[a.model]}{a.effort ? ` · esfuerzo ${EFFORT_LABEL[a.effort]}` : ''}</span>}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{a.description}</p>
      </header>

      <Section title="Responsabilidades"><Bullets items={a.responsibilities} /></Section>
      {a.outputs.length > 0 && <Section title="Entregables"><Bullets items={a.outputs} /></Section>}

      <Section title="Jerarquía">
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-xs text-slate-500">Superior</div>
            {boss ? <AgentLink a={boss} onClick={() => select({ kind: 'agent', id: boss.id })} /> : <p className="text-sm text-slate-400">Cabeza de la organización</p>}
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-500">Subordinados ({subs.length})</div>
            {subs.length === 0 ? <p className="text-sm text-slate-400">Ninguno (los subagentes no lanzan otros agentes)</p> : (
              <div className="grid gap-1.5">{subs.map((s) => <AgentLink key={s.id} a={s} onClick={() => select({ kind: 'agent', id: s.id })} />)}</div>
            )}
          </div>
        </div>
      </Section>

      {rels.length > 0 && (
        <Section title="Relaciones funcionales">
          <ul className="space-y-1.5 text-sm text-slate-300">
            {rels.map((r) => {
              const other = agentById(r.from === a.id ? r.to : r.from)
              return (
                <li key={r.id} className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
                  <span className="text-slate-500">{r.from === a.id ? '→' : '←'}</span>{' '}
                  <button className="font-medium text-sky-300 hover:underline" onClick={() => other && select({ kind: 'agent', id: other.id })}>{other?.name ?? 'Javier'}</button>
                  <span className="text-slate-400"> · {r.label}</span>
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {(teams.length > 0 || usedBy.length > 0) && (
        <Section title="Equipos">
          <div className="flex flex-wrap gap-1.5">
            {teams.map((t) => <button key={t.id} onClick={() => select({ kind: 'team', id: t.id })} className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700">{t.name}</button>)}
            {usedBy.map((t) => <button key={t.id} onClick={() => select({ kind: 'team', id: t.id })} className="rounded-md border border-dashed border-slate-700 px-2 py-1 text-xs text-slate-400 hover:text-slate-200">uso habitual en {t.name}</button>)}
          </div>
        </Section>
      )}

      <Section title="Herramientas">
        {a.tools.note && <p className="mb-2 text-sm text-slate-400">{a.tools.note}</p>}
        <div className="flex flex-wrap gap-1.5">
          {a.tools.inherits && <Chip>hereda de la sesión</Chip>}
          {a.tools.allowed.map((t) => <Chip key={t}>{t}</Chip>)}
          {a.tools.denied.map((t) => <Chip key={t} tone="rose">{t}</Chip>)}
          {!a.tools.inherits && a.tools.allowed.length === 0 && a.tools.denied.length === 0 && <span className="text-sm text-slate-500">—</span>}
        </div>
      </Section>

      <Section title="Permisos y autonomía">
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs"><span className="font-medium text-slate-200">{AUTONOMY_LABEL[a.autonomy.level]}</span><span className="text-slate-500">nivel {a.autonomy.level} de 3</span></div>
          <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= a.autonomy.level ? 'bg-sky-400' : 'bg-slate-800'}`} />)}</div>
          <p className="mt-1.5 text-xs text-slate-400">{a.autonomy.label}</p>
        </div>
        <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-slate-500">Escritura</dt><dd className="text-slate-300">{a.permissions.writeScope}</dd>
          <dt className="text-slate-500">Commit</dt><dd className="text-slate-300">{COMMIT[a.permissions.canCommit]}</dd>
          <dt className="text-slate-500">Push</dt><dd className="text-slate-300">{a.permissions.canPush ? 'Sí' : 'Nunca'}</dd>
        </dl>
        {a.permissions.notes.length > 0 && <div className="mt-3"><Bullets items={a.permissions.notes} /></div>}
        {a.autonomy.stopConditions.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 text-xs text-slate-500">Se detiene y consulta cuando…</div>
            <Bullets items={a.autonomy.stopConditions} />
          </div>
        )}
      </Section>

      <Section title="Memoria y contexto">
        <p className="mb-2 text-sm text-slate-300">{a.context.memory}</p>
        {a.context.notes && <p className="mb-2 text-xs text-slate-400">{a.context.notes}</p>}
        <div className="text-xs text-slate-500">Lee al empezar</div>
        <div className="mt-1 flex flex-wrap gap-1.5">{a.context.reads.map((r) => <Chip key={r}>{r}</Chip>)}</div>
      </Section>

      <Section title="Tareas actuales">
        {tasks.length > 0 ? (
          <ul className="space-y-1.5 text-sm text-slate-300">{tasks.map((t) => <li key={t.id} className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">{t.title}</li>)}</ul>
        ) : (
          <p className="text-sm text-slate-500">{live ? 'Sin tareas activas.' : 'Sin datos de ejecución: se mostrarán cuando se conecte el backend de orquestación.'}</p>
        )}
      </Section>

      {a.source && <Section title="Definición"><code className="break-all text-xs text-slate-400">{a.source}</code></Section>}
    </>
  )
}

function TeamDetail({ id }: { id: string }) {
  const { model, agentById, select } = useOrg()
  const t = model.teams.find((x) => x.id === id)
  if (!t) return null
  return (
    <>
      <header className="px-5 pb-4 pt-5">
        <h2 className="text-lg font-semibold text-slate-50">{t.name}</h2>
        <p className="text-sm text-slate-400">{t.kind === 'central' ? 'Equipo central compartido' : 'Equipo de proyecto'}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{t.mission}</p>
        <dl className="mt-3 grid grid-cols-[70px_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-slate-500">Repo</dt><dd className="font-mono text-slate-300">{t.repo}</dd>
          <dt className="text-slate-500">Stack</dt><dd className="text-slate-300">{t.stack}</dd>
        </dl>
      </header>
      <Section title={`Integrantes (${t.memberIds.length})`}>
        <div className="grid gap-1.5">{t.memberIds.map((m) => { const a = agentById(m); return a && <AgentLink key={m} a={a} onClick={() => select({ kind: 'agent', id: m })} /> })}</div>
      </Section>
      {t.commonlyUses.length > 0 && (
        <Section title="Especialistas compartidos que usa">
          <div className="grid gap-1.5">{t.commonlyUses.map((m) => { const a = agentById(m); return a && <AgentLink key={m} a={a} onClick={() => select({ kind: 'agent', id: m })} /> })}</div>
        </Section>
      )}
      <Section title="Responsabilidades"><Bullets items={t.responsibilities} /></Section>
      <Section title="Relaciones funcionales"><Bullets items={t.functionalRelations} /></Section>
    </>
  )
}

function StepDetail({ workflowId, id }: { workflowId: string; id: string }) {
  const { model, agentById, select } = useOrg()
  const w = model.workflows.find((x) => x.id === workflowId)
  const s = w?.steps.find((x) => x.id === id)
  if (!w || !s) return null
  const a = s.agentId ? agentById(s.agentId) : undefined
  const incoming = w.edges.filter((e) => e.to === s.id)
  const outgoing = w.edges.filter((e) => e.from === s.id)
  const name = (sid: string) => w.steps.find((x) => x.id === sid)?.label ?? sid
  const TYPE = { start: 'Inicio', agent: 'Paso de agente', human: 'Aprobación humana', decision: 'Decisión', end: 'Fin' } as const
  return (
    <>
      <header className="px-5 pb-4 pt-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{w.name}</div>
        <h2 className="mt-1 text-lg font-semibold text-slate-50">{s.label}</h2>
        <p className="text-sm text-slate-400">{TYPE[s.type]}</p>
        {s.detail && <p className="mt-3 text-sm leading-relaxed text-slate-300">{s.detail}</p>}
      </header>
      {a && <Section title="Agente responsable"><AgentLink a={a} onClick={() => select({ kind: 'agent', id: a.id })} /></Section>}
      <Section title="Entradas"><Bullets items={incoming.map((e) => `${name(e.from)}${e.label ? ` — ${e.label}` : ''}`)} /></Section>
      <Section title="Salidas"><Bullets items={outgoing.map((e) => `${name(e.to)}${e.label ? ` — ${e.label}` : ''}`)} /></Section>
    </>
  )
}

export function DetailPanel() {
  const { selection, select } = useOrg()
  if (!selection) return null
  return (
    <aside className="scroll-thin absolute inset-x-0 bottom-0 z-30 max-h-[68vh] overflow-y-auto rounded-t-2xl border-t border-slate-700 bg-[#0d1320]/98 shadow-2xl backdrop-blur md:static md:inset-auto md:max-h-none md:w-[400px] md:shrink-0 md:rounded-none md:border-l md:border-t-0">
      <div className="sticky top-0 z-10 flex justify-end bg-[#0d1320]/95 px-3 pt-2 backdrop-blur">
        <button onClick={() => select(null)} aria-label="Cerrar panel" className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200">Cerrar ✕</button>
      </div>
      {selection.kind === 'agent' && <AgentDetail key={selection.id} id={selection.id} />}
      {selection.kind === 'team' && <TeamDetail key={selection.id} id={selection.id} />}
      {selection.kind === 'step' && <StepDetail key={selection.id} workflowId={selection.workflowId} id={selection.id} />}
    </aside>
  )
}
