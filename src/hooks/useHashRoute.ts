import { useEffect, useState } from 'react'

export type Route = 'organization' | 'teams' | 'workflows'
const ROUTES: Route[] = ['organization', 'teams', 'workflows']

function read(): Route {
  const h = window.location.hash.replace(/^#\/?/, '') as Route
  return ROUTES.includes(h) ? h : 'organization'
}

export function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return [route, (r) => (window.location.hash = `/${r}`)]
}
