import { useState, type ReactNode } from 'react'
import { Panel } from '@xyflow/react'

/** Panel flotante plegable (abierto en escritorio, plegado por defecto en móvil). */
export function ToolPanel({ title, children, width }: { title: string; children: ReactNode; width?: string }) {
  const [open, setOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 768)
  return (
    <Panel position="top-left" className="!m-3 max-w-[calc(100%-1.5rem)]">
      <div className={`rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur ${open ? width ?? '' : ''}`}>
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-6 px-3 py-2 text-left">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</span>
          <span className="text-xs text-slate-500">{open ? '▾' : '▸'}</span>
        </button>
        {open && <div className="px-3 pb-3">{children}</div>}
      </div>
    </Panel>
  )
}
