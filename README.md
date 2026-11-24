# habin-agents-dashboard

Panel web para visualizar y explorar la organización de agentes de IA de **habin-agents-gang** (agentes globales + especialistas de cada proyecto). Proyecto independiente: no modifica ningún otro repo.

React + TypeScript · React Flow (`@xyflow/react`) · Tailwind CSS v4 · Vite.

## Arrancar
```
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build estático en dist/
npm run check:agents   # compara config/ con los .md reales de los agentes
```

## Vistas
- **Organization**: organigrama por áreas (Dirección, Arquitectura, Ejecución, Calidad, Negocio y un grupo por proyecto). Nodos arrastrables (la disposición se guarda en el navegador), zoom, minimapa y filtros de relaciones funcionales (traspaso, escalado, revisión, petición, aprobación).
- **Teams**: equipo central compartido arriba y equipos de proyecto abajo; al seleccionar un equipo o un agente compartido se ve su uso habitual.
- **Workflows**: 7 flujos (estándar, modo jefe, escalado, cambios de riesgo, validación de ideas, publicación en tiendas, contenido de Paddock) con delegaciones, revisiones, aprobaciones humanas y reintentos.
- **Panel lateral** al seleccionar: puesto, descripción, responsabilidades, superior/subordinados, relaciones, herramientas (permitidas y denegadas), permisos y autonomía, memoria y contexto, tareas actuales.

## Arquitectura: datos separados de la visualización
```
config/                 ← fuente de verdad, JSON independiente de la UI
  agents.json  areas.json  teams.json  relations.json  workflows.json
src/domain/             ← tipos (types.ts) y estados (status.ts)
src/data/               ← OrgDataSource: staticSource (JSON) | restSource (API REST, preparado)
src/runtime/            ← RuntimeSource: estado en vivo (hoy nullRuntime, sin backend)
src/layout/             ← construye nodos y aristas a partir del modelo (org, teams, workflow)
src/components, views/  ← solo presentación
```
- **Cambiar la organización**: edita `config/*.json` (la UI se adapta). `src/data/validate.ts` avisa por consola de referencias rotas.
- **Mantener sincronía con los agentes reales**: `npm run check:agents` lee los `.md` de `habin-agents-gang/agents/` y de `.claude/agents/` de cada repo y lista diferencias de modelo, esfuerzo y herramientas.
- **Conectar un backend**: define `VITE_API_BASE_URL` (ver `.env.example`) y se usa `restSource` (`GET /org/agents|areas|teams|relations|workflows`). Para estados en vivo implementa `RuntimeSource` (SSE o WebSocket) y pásalo a `<OrgProvider runtime={...}>`.
- **Estados**: `IDLE · WORKING · REVIEW · BLOCKED · ERROR · SIN DATOS` (`src/domain/status.ts`). Sin backend todos salen «SIN DATOS»; la casilla «Previsualizar estados» solo sirve para ver el diseño y no simula ejecución.

## Qué es propuesta y qué viene de los agentes
Salen de los `.md` reales: nombre, descripción, modelo, esfuerzo, herramientas, límites y flujos (README y CLAUDE.md de habin-agents-gang). Son una propuesta de visualización, editable en `config/`: la agrupación en **áreas**, los niveles de **autonomía**, el **uso habitual** de agentes compartidos por equipo y las **relaciones funcionales** entre agentes.
