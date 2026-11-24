import type { OrgModel } from '../domain/types'
import type { OrgDataSource } from './source'

/**
 * Adaptador REST (preparado, sin backend todavía).
 * Endpoints previstos bajo VITE_API_BASE_URL:
 *   GET /org/agents  /org/areas  /org/teams  /org/relations  /org/workflows
 */
export function createRestSource(baseUrl: string): OrgDataSource {
  const get = async <T,>(path: string): Promise<T> => {
    const res = await fetch(`${baseUrl}${path}`, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
    return (await res.json()) as T
  }
  return {
    name: 'rest',
    async load() {
      const [agents, areas, teams, relations, workflows] = await Promise.all([
        get<OrgModel['agents']>('/org/agents'),
        get<OrgModel['areas']>('/org/areas'),
        get<OrgModel['teams']>('/org/teams'),
        get<OrgModel['relations']>('/org/relations'),
        get<OrgModel['workflows']>('/org/workflows'),
      ])
      return { agents, areas, teams, relations, workflows }
    },
  }
}
