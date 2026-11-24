#!/usr/bin/env node
// Compara config/agents.json con los .md reales de los agentes (frontmatter).
// Uso: npm run check:agents [-- <carpeta con los repos>]   (por defecto, la carpeta padre)
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const root = resolve(process.argv[2] ?? join(here, '..', '..'))
const config = JSON.parse(readFileSync(join(here, '..', 'config', 'agents.json'), 'utf8'))

const dirs = [
  join(root, 'habin-agents-gang', 'agents'),
  join(root, 'Paddock', '.claude', 'agents'),
  join(root, 'parrotrip', '.claude', 'agents'),
  join(root, 'personalDashboard', '.claude', 'agents'),
]
const GLOBAL = new Set(['jefe','arquitecto','implementador','revisor','mecanico','redactor-es','release-movil','investigador-mercado','validador-idea','cumplimiento'])

function frontmatter(file) {
  const m = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)
  const out = {}
  if (!m) return out
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return out
}

const real = new Map()
for (const d of dirs) {
  if (!existsSync(d)) { console.warn(`· no existe ${d}`); continue }
  for (const f of readdirSync(d).filter((x) => x.endsWith('.md'))) {
    const fm = frontmatter(join(d, f))
    const id = fm.name ?? f.replace(/\.md$/, '')
    // las copias de agentes globales en los repos no cuentan como agentes nuevos
    if (!real.has(id) || d.includes('habin-agents-gang')) real.set(id, fm)
  }
}

let problems = 0
const warn = (m) => { problems++; console.log('✗ ' + m) }
const cfg = new Map(config.map((a) => [a.id, a]))

for (const [id, fm] of real) {
  const a = cfg.get(id)
  if (!a) { warn(`${id}: existe como agente pero no está en config/agents.json`); continue }
  if (fm.model && a.model !== fm.model) warn(`${id}: model config=${a.model} real=${fm.model}`)
  if (fm.effort && a.effort !== fm.effort) warn(`${id}: effort config=${a.effort} real=${fm.effort}`)
  if (fm.tools) {
    const real = fm.tools.split(',').map((t) => t.trim()).sort().join(',')
    const conf = [...a.tools.allowed].sort().join(',')
    if (real !== conf) warn(`${id}: tools config=[${conf}] real=[${real}]`)
  }
  if (fm.disallowedTools) {
    const real = fm.disallowedTools.split(',').map((t) => t.trim()).sort().join(',')
    const conf = [...a.tools.denied].sort().join(',')
    if (real !== conf) warn(`${id}: disallowedTools config=[${conf}] real=[${real}]`)
  }
}
for (const a of config) {
  if (['javier', 'explore'].includes(a.id)) continue
  if (!real.has(a.id)) warn(`${a.id}: está en config pero no se encontró su .md`)
  else if (!GLOBAL.has(a.id) && a.kind === 'core') warn(`${a.id}: marcado como core pero no es global`)
}
console.log(problems ? `\n${problems} diferencia(s).` : `✓ config/agents.json coincide con ${real.size} agentes reales.`)
process.exit(problems ? 1 : 0)
