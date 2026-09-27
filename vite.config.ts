import { beastDevtools } from '@beastjs/devtools'
import tailwindcss from '@tailwindcss/vite'
import { beastOctane } from 'beast-tsrx/vite'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const demosDir = fileURLToPath(new URL('./src/demos', import.meta.url))

/**
 * Exposes every demo's .btsx source as a string map so the page can show the
 * exact code it runs. (A `?raw` import would still be claimed by Beast's
 * transform, which matches on the file extension alone.)
 */
function demoSources(): Plugin {
  const id = 'virtual:demo-sources'
  const resolved = `\0${id}`
  return {
    name: 'demo-sources',
    resolveId: (source) => (source === id ? resolved : undefined),
    load(loadId) {
      if (loadId !== resolved) return
      const files = readdirSync(demosDir, { recursive: true, encoding: 'utf8' }).filter((file) =>
        file.endsWith('.btsx')
      )
      const map: Record<string, string> = {}
      for (const file of files) {
        const path = join(demosDir, file)
        this.addWatchFile(path)
        map[`./${file.replaceAll('\\', '/')}`] = readFileSync(path, 'utf8')
      }
      return `export default ${JSON.stringify(map)};`
    }
  }
}

/**
 * Workaround for an Octane 0.4.3 view-transition bug.
 *
 * When a subtree mounts inside a transition and contains *nested*
 * <ViewTransition> boundaries, those boundaries are grouped before commit —
 * while their parent nodes still belong to the inert <template> document they
 * were cloned from. Octane then starts a second transition on that inert
 * document (which returns null) and throws, leaving later updates stuck.
 *
 * Treating a boundary whose parent has no browsing context as "not visible yet"
 * lets it be picked up as an enter after commit, which is the intended result.
 * Remove this once fixed upstream; the build fails if the target code moves.
 */
function patchOctaneInertOwner(): Plugin {
  const target = 'return parent.nodeType === 9 ? parent : parent.ownerDocument;'
  const patched =
    'if (parent.nodeType === 9) return parent; return parent.ownerDocument.defaultView === null ? null : parent.ownerDocument;'
  return {
    name: 'patch-octane-inert-owner',
    enforce: 'pre',
    transform(code, id) {
      if (!/[\\/]octane[\\/]dist[\\/]runtime\.js/.test(id)) return
      if (!code.includes(target)) {
        this.error('octane runtime changed: remove or update patchOctaneInertOwner in vite.config.ts')
      }
      return { code: code.replace(target, patched), map: null }
    }
  }
}

/**
 * Beast devtools are opt-in: `BEAST_DEVTOOLS=1 bun run dev`.
 *
 * The devtools panel is its own Octane root that re-renders after every app
 * commit (via the profiling hook). That update lands while Octane is preparing
 * a view transition, so the transition is skipped — only the state change
 * shows. Keep it off by default so the showcase animates.
 */
const devtools = process.env.BEAST_DEVTOOLS === '1'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    patchOctaneInertOwner(),
    tailwindcss(),
    demoSources(),
    beastOctane(devtools ? { octane: { profile: 'auto' } } : {}),
    ...(devtools ? [beastDevtools()] : [])
  ]
})
