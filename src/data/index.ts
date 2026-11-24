import { createRestSource } from './restSource'
import { staticSource } from './staticSource'
import type { OrgDataSource } from './source'

const api = import.meta.env.VITE_API_BASE_URL as string | undefined
/** Sin VITE_API_BASE_URL se usa la configuración estática de /config. */
export const dataSource: OrgDataSource = api ? createRestSource(api) : staticSource
export type { OrgDataSource }
