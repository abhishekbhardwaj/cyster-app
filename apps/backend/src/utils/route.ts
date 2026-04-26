import { type RoutePrefix } from './constants'

export const generateRoute = (prefix: RoutePrefix, ...path: string[]): string => {
  if (path.length === 0 || (path.length === 1 && path[0] === '/')) return prefix
  const combinedPath = `${prefix}/${path.join('/')}`
  return combinedPath.replace(/\/{2,}/g, '/')
}
