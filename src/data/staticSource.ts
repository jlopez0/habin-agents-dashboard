import agents from '@config/agents.json'
import areas from '@config/areas.json'
import teams from '@config/teams.json'
import relations from '@config/relations.json'
import workflows from '@config/workflows.json'
import type { OrgModel } from '../domain/types'
import type { OrgDataSource } from './source'

export const staticSource: OrgDataSource = {
  name: 'static-json',
  async load() {
    return { agents, areas, teams, relations, workflows } as unknown as OrgModel
  },
}
