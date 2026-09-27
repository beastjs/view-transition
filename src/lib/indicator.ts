import { useLayoutEffect, useRef, useState } from 'octane'

export interface IndicatorBox {
  left: number
  width: number
}

/**
 * A single tab indicator that slides between tabs with a plain CSS transition.
 *
 * Attach `strip` to the (positioned) tab container and mark the active tab
 * with `data-active="true"`; `box` is its offset within the strip, re-measured
 * whenever `active` changes, fonts finish loading, or the window resizes.
 */
export function useIndicator(active: string) {
  const strip = useRef<HTMLElement | null>(null)
  const [box, setBox] = useState<IndicatorBox | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const tab = strip.current?.querySelector<HTMLElement>('[data-active="true"]')
      if (tab) setBox({ left: tab.offsetLeft, width: tab.offsetWidth })
    }
    measure()
    void document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active])
  return { strip, box }
}
