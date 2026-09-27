/// <reference types="vite/client" />

declare module '*.btsx' {
  import type { ComponentBody } from 'octane'

  const component: ComponentBody
  export default component
}

declare module 'virtual:demo-sources' {
  const sources: Record<string, string>
  export default sources
}
