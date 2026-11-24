export type AgentKind = 'human' | 'coordinator' | 'core' | 'specialist' | 'builtin'
export type ModelTier = 'opus' | 'sonnet' | 'haiku'
export type Effort = 'low' | 'medium' | 'high'
export type AutonomyLevel = 0 | 1 | 2 | 3
export type CommitPolicy = 'si' | 'no' | 'bajo-peticion' | 'no-definido'

export interface ToolSet {
  inherits: boolean
  allowed: string[]
  denied: string[]
  note?: string
}

export interface Agent {
  id: string
  name: string
  role: string
  summary: string
  description: string
  kind: AgentKind
  areaId: string
  teamIds: string[]
  reportsTo: string | null
  model?: ModelTier
  effort?: Effort
  accent?: string
  tools: ToolSet
  responsibilities: string[]
  outputs: string[]
  permissions: { writeScope: string; canCommit: CommitPolicy; canPush: boolean; notes: string[] }
  autonomy: { level: AutonomyLevel; label: string; stopConditions: string[] }
  context: { reads: string[]; memory: string; notes?: string }
  source?: string
  /** Estático: vacío. Lo rellenará el backend de orquestación (ver runtime). */
  currentTasks: AgentTask[]
}

export interface AgentTask {
  id: string
  title: string
  startedAt?: string
}

export type AreaTone = 'amber' | 'violet' | 'sky' | 'orange' | 'cyan' | 'emerald'
export interface Area {
  id: string
  name: string
  description: string
  tone: AreaTone
}

export interface Team {
  id: string
  name: string
  kind: 'central' | 'project'
  mission: string
  repo: string
  stack: string
  memberIds: string[]
  commonlyUses: string[]
  responsibilities: string[]
  functionalRelations: string[]
}

export type RelationKind = 'handoff' | 'escalation' | 'review' | 'request' | 'approval'
export interface Relation {
  id: string
  from: string
  to: string
  kind: RelationKind
  label: string
}

export type StepType = 'start' | 'agent' | 'human' | 'decision' | 'end'
export type FlowEdgeKind = 'flow' | 'delegation' | 'review' | 'approval' | 'loop' | 'escalation'
export interface WorkflowStep {
  id: string
  type: StepType
  label: string
  agentId?: string
  detail?: string
}
export interface WorkflowEdge {
  from: string
  to: string
  label?: string
  kind: FlowEdgeKind
  loop?: boolean
}
export interface Workflow {
  id: string
  name: string
  description: string
  trigger: string
  source: string
  steps: WorkflowStep[]
  edges: WorkflowEdge[]
}

export interface OrgModel {
  agents: Agent[]
  areas: Area[]
  teams: Team[]
  relations: Relation[]
  workflows: Workflow[]
}

export type Selection =
  | { kind: 'agent'; id: string }
  | { kind: 'team'; id: string }
  | { kind: 'step'; workflowId: string; id: string }
  | null
