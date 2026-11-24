import type { OrgModel } from '../domain/types'

/**
 * Contrato de acceso a la definición de la organización.
 * Hoy: JSON estático en /config. Mañana: API REST del backend de orquestación.
 */
export interface OrgDataSource {
  readonly name: string
  load(): Promise<OrgModel>
}
