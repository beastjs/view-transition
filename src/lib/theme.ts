import { addTransitionType, createContext, startTransition } from 'octane'

export type Theme = 'dark' | 'light'

export interface ThemeState {
  theme: Theme
  setTheme: (update: (current: Theme) => Theme) => void
}

export const ThemeContext = createContext<ThemeState>({ theme: 'dark', setTheme: () => {} })

/**
 * Flip the theme inside a typed transition. The CSS keyed on
 * `:active-view-transition-type(theme)` clips the new root snapshot open as a
 * circle centred on the pointer (or on the trigger, for keyboard activation).
 */
export function revealTheme(state: ThemeState, event: MouseEvent) {
  const target = event.currentTarget as HTMLElement | null
  let x = event.clientX
  let y = event.clientY
  if (event.detail === 0 && target !== null) {
    const rect = target.getBoundingClientRect()
    x = rect.left + rect.width / 2
    y = rect.top + rect.height / 2
  }
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  const root = document.documentElement.style
  root.setProperty('--reveal-x', `${x}px`)
  root.setProperty('--reveal-y', `${y}px`)
  root.setProperty('--reveal-r', `${radius}px`)
  // Octane keeps the root out of the snapshot (`view-transition-name: none`)
  // so untouched content stays live. The reveal needs the whole page, so opt
  // the root back in for this one transition only.
  root.setProperty('view-transition-name', 'root')
  startTransition(() => {
    addTransitionType('theme')
    state.setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  })
  void releaseRootAfterTransition()
}

type DocumentWithActiveTransition = Document & { activeViewTransition?: { finished: Promise<void> } | null }

async function releaseRootAfterTransition() {
  const doc = document as DocumentWithActiveTransition
  for (let frame = 0; frame < 30 && !doc.activeViewTransition; frame++) {
    await new Promise((resolve) => requestAnimationFrame(resolve))
  }
  await doc.activeViewTransition?.finished.catch(() => {})
  document.documentElement.style.removeProperty('view-transition-name')
}
