import type { OrgModel } from '../domain/types'

/** Integridad referencial de la configuración. Devuelve la lista de problemas (vacía si todo cuadra). */
export function validateModel(m: OrgModel): string[] {
  const issues: string[] = []
  const agentIds = new Set(m.agents.map((a) => a.id))
  const areaIds = new Set(m.areas.map((a) => a.id))
  const teamIds = new Set(m.teams.map((t) => t.id))
  for (const a of m.agents) {
    if (!areaIds.has(a.areaId)) issues.push(`Agente ${a.id}: área desconocida ${a.areaId}`)
    if (a.reportsTo && !agentIds.has(a.reportsTo)) issues.push(`Agente ${a.id}: superior desconocido ${a.reportsTo}`)
    for (const t of a.teamIds) if (!teamIds.has(t)) issues.push(`Agente ${a.id}: equipo desconocido ${t}`)
  }
  for (const t of m.teams) {
    for (const id of [...t.memberIds, ...t.commonlyUses]) if (!agentIds.has(id)) issues.push(`Equipo ${t.id}: agente desconocido ${id}`)
  }
  for (const r of m.relations) {
    if (!agentIds.has(r.from) || !agentIds.has(r.to)) issues.push(`Relación ${r.id}: extremo desconocido`)
  }
  for (const w of m.workflows) {
    const steps = new Set(w.steps.map((s) => s.id))
    for (const s of w.steps) if (s.agentId && !agentIds.has(s.agentId)) issues.push(`Workflow ${w.id}: agente desconocido ${s.agentId}`)
    for (const e of w.edges) if (!steps.has(e.from) || !steps.has(e.to)) issues.push(`Workflow ${w.id}: arista rota ${e.from}→${e.to}`)
  }
  return issues
}
