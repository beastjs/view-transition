# Perfected Transitions

A showcase of `<ViewTransition>` in [Octane](https://octanejs.dev/), written in
[Beast](https://www.npmjs.com/package/beast-tsrx) (`.btsx`). The look borrows
from [okc.media](https://okc.media/en/): charcoal, large lowercase type, and
very little chrome.

```bash
bun install
bun run dev
```

Sixteen live examples in three tiers. Every page section shows the example
running next to its exact source:

| Tier     | Examples                                                                                     |
| -------- | -------------------------------------------------------------------------------------------- |
| basic    | rolling counter · compact ↔ detail · shared underline · pop in/out · list reorder            |
| moderate | magic-move card · gallery → lightbox · filter with enter/exit · directional routes · Suspense |
| advanced | circular theme reveal · list → detail ×4 · staggered board · swipe deck · wizard · orchestrated layout |

Patterns come from `VT_beast.md`, `VT_MOD_beast.md` and `VT_ADV_beast.md`, and
each example says which section it's based on. Some APIs in those notes don't
exist in Octane (`useViewTransition`, a `mode` prop, `group`/`types` props), so
the examples use the real ones: `startTransition`, `addTransitionType`,
`enter`/`exit`/`update`/`share` class maps, and `onUpdate` with a
`ViewTransitionInstance`.

## ViewTransition reference

This section describes `ViewTransition` as it ships in `octane@0.4.3`. The
details come from the package's type definitions and runtime, not from React's
docs. The two mostly agree, and the differences are noted below.

```btsx
import { ViewTransition, addTransitionType, startTransition } from "octane";
```

### How a boundary works

`ViewTransition` renders no DOM of its own. It marks the host elements directly
inside it as a unit that can animate. When an update runs inside a transition,
Octane does four things:

1. It records every boundary that's visible before the update.
2. It calls `document.startViewTransition()`, commits the update inside its
   callback, and records every boundary that's visible afterwards.
3. It works out what happened to each boundary (enter, exit, update, share or
   parent relay). It resolves the matching class prop and writes
   `view-transition-name` and `view-transition-class` inline on the boundary's
   elements.
4. When the browser's `ready` promise resolves, it calls the matching `on*`
   callbacks. It removes the inline styles again when the transition finishes.

Your CSS then targets the pseudo-elements by name or by class:

```css
::view-transition-group(b-count) { … }   /* by name */
::view-transition-new(*.pop)     { … }   /* by class, any name */
```

Something only animates when all of these are true:

- **It's a transition.** The update was started by `startTransition`, the
  `start` function from `useTransition`, or a Suspense reveal inside one. Plain
  `setState` calls don't animate.
- **It's on screen.** Boundaries outside the viewport are skipped, both before
  and after the update.
- **The browser supports it.** Without `document.startViewTransition` the update
  just applies instantly, with no extra code needed.
- **Its class didn't resolve to `"none"`.** If no boundary has anything to do,
  Octane skips the native transition entirely.

### Props at a glance

| Prop | Type | Default | Fires when |
| --- | --- | --- | --- |
| `name` | `string` | auto-generated | — (sets identity; enables `share`) |
| `enter` | class value | `default` → `"auto"` | the boundary appears |
| `exit` | class value | `default` → `"auto"` | the boundary disappears |
| `update` | class value | `default` → `"auto"` | its content or layout changes |
| `share` | class value | `default` → `"auto"` | one boundary exits and another with the same `name` enters |
| `parentEnter` | class value | `default` → `"auto"` | an ancestor unit enters (experimental relay) |
| `parentExit` | class value | `default` → `"auto"` | an ancestor unit exits (experimental relay) |
| `default` | class value | `"auto"` | fallback for every prop above |
| `onEnter` / `onExit` / `onUpdate` / `onShare` | `(instance, types) => void \| cleanup` | — | same triggers, once animations exist |
| `onParentEnter` / `onParentExit` | same | — | same relay triggers |
| `ref` | callback, object or array ref | — | receives the `ViewTransitionInstance` |
| `scope` | `"element"` | inherited | makes the host element its own transition root |
| `children` | anything | — | the content being animated |

### Class values

`enter`, `exit`, `update`, `share`, `parentEnter`, `parentExit` and `default` all
take the same kind of value:

| Value | Meaning |
| --- | --- |
| `"auto"` | Animate with the browser's default: a cross-fade, plus a size/position morph on the group. No class is written. |
| `"none"` | Don't animate this boundary for this trigger. |
| any other string | Written as `view-transition-class`. Style it with `::view-transition-*(*.your-class)`. Several space-separated classes are allowed. |
| `{ [type]: value, default?: value }` | Choose by transition type. See below. |

A type map is resolved against the types added with `addTransitionType` in the
current transition:

- Every active type that has an entry contributes its class, and the classes are
  joined with spaces.
- If any matching entry is `"none"`, the result is `"none"`.
- If no type matches, the map's own `default` key is used.
- If the prop is missing or resolves to nothing, the `default` **prop** is
  resolved the same way. If that also resolves to nothing, the result is
  `"auto"`.

```btsx
setup
  const step = (delta: number) => startTransition(() => {
    addTransitionType(delta > 0 ? "up" : "down");
    setCount((value) => value + delta);
  });

ViewTransition(name="b-count" update={{ up: "roll-up", down: "roll-down", default: "none" }})
  span #{count}
```

In this example, `+` rolls up, `−` rolls down, and any other transition that
happens to touch the counter doesn't animate it. See
`src/demos/basic/Counter.btsx`.

Types only last for the transition they were added in. Call
`addTransitionType` synchronously inside the `startTransition` callback. The same
types are also exposed to CSS as `:root:active-view-transition-type(up)`, which
the theme reveal uses.

### `name`

`name` is the `view-transition-name` written onto the boundary's element.

- **When you omit it** (or pass `"auto"`), Octane generates a unique name like
  `‹vt12›`. Enter, exit and update still work, but the boundary can't be
  shared.
- **When you set it**, the boundary can `share`, and you can target it in CSS
  with `::view-transition-group(your-name)`.
- **Names must be unique among boundaries visible in the same transition.** In
  development, Octane logs `Two ViewTransition boundaries use the same name in
  one capture` when two collide. Add an id to repeated items:
  `` name={`b-row-${person.id}`} ``.
- **If a boundary wraps several top-level elements**, the first gets `name` and
  the others get `name-1`, `name-2`, and so on. Wrap one element when you want
  one animation.

### `enter` and `exit`

`enter` runs when a boundary that wasn't visible before the update is visible
after it (mounted, or scrolled into view by the update). `exit` is the reverse.
Only the outermost boundary of a unit that appears or disappears animates. Named
boundaries inside it don't get their own enter or exit, but they can still pair
up for a `share`.

`key` decides what counts as new. To make a swap animate as exit plus enter
instead of an update, give the content a new key:

```btsx
each route in [ROUTES[index]] key route.path
  ViewTransition(enter={ENTER} exit={EXIT})
    section …
```

See `src/demos/moderate/Routes.btsx` and `src/demos/basic/Toasts.btsx`
(`enter="pop" exit="pop"`).

### `update`

`update` runs when a boundary is visible both before and after the update, and
either the DOM inside it changed or its size or position did. When a nested
boundary changes, clipping ancestors can be marked as updated too.

A few ways to use it:

- **`"auto"`** morphs the box from old to new, for example a list item sliding
  to a new slot (`src/demos/basic/SortList.btsx`).
- **A custom class** changes how it looks. `update="fade"` gives a softer
  cross-fade.
- **`"none"` on a wrapper** keeps the wrapper still while the boundaries inside
  it animate. The page frame does this: see `update="none"` in
  `src/components/DemoFrame.btsx` and on the tier wrapper in `src/App.btsx`.

### `share`

A share happens when, in one transition, a named boundary exits and another
boundary with the **same name** enters. The browser then morphs one into the
other instead of fading one out and the other in. This is the "magic move" or
shared-element effect.

- The pair replaces the separate exit and enter animations.
- The exiting side's `share` decides whether the share happens at all:
  `"none"` cancels it.
- The entering side's `share` class is what gets applied, so set the same value
  on both sides.
- Both boundaries must be in the viewport.

```btsx
if tab === t
  ViewTransition(name="b-tab-underline" share="glide")
    span.underline
```

See `src/demos/basic/Tabs.btsx`, `src/demos/moderate/Lightbox.btsx`, and
`src/demos/advanced/ProductMorph.btsx`, which uses four shared names per
product.

### `default`

`default` is used for any trigger whose own prop is missing or resolves to
nothing. `default="none"` is the usual way to opt a boundary out of everything
and then opt back in with a single prop, for example `default="none" share="morph"`.

### `parentEnter` and `parentExit` (experimental)

These follow React's experimental `enableViewTransitionParentEnterExit`
behavior. Normally only the outermost boundary of an appearing or disappearing
unit animates. A nested boundary with `parentEnter` or `parentExit` can animate
as well, but only when:

- every boundary in between also relays, by declaring the same prop or its
  `onParent*` handler without resolving to `"none"`, and
- the outermost boundary really enters or exits, rather than resolving to
  `"none"` or being used by a share.

Use this for staggered children inside a panel that slides in as one.

### Callbacks: `onEnter`, `onExit`, `onUpdate`, `onShare`, `onParentEnter`, `onParentExit`

```ts
(instance: ViewTransitionInstance, types: string[]) => void | (() => void)
```

Each callback fires for its trigger once the browser's `ready` promise
resolves, which means the pseudo-elements and their CSS animations already
exist.

- `instance` gives you handles to the boundary's pseudo-elements.
- `types` holds the transition types that were active.
- Returning a function registers a cleanup, which runs when the transition
  finishes or is interrupted.
- An error thrown inside a callback is logged and doesn't break the transition.

```ts
interface ViewTransitionInstance {
  name: string
  group: ViewTransitionPseudoElement      // ::view-transition-group(name)
  imagePair: ViewTransitionPseudoElement  // ::view-transition-image-pair(name)
  old: ViewTransitionPseudoElement        // ::view-transition-old(name)
  new: ViewTransitionPseudoElement        // ::view-transition-new(name)
}

class ViewTransitionPseudoElement {
  readonly selector: string                                   // e.g. "::view-transition-new(hero)"
  animate(keyframes, options?): Animation                     // Web Animations on the pseudo-element
  getAnimations(): Animation[]                                // the animations running on it now
  getComputedStyle(): CSSStyleDeclaration
}
```

The staggered board uses this to retime the CSS animations that are already
running (`src/demos/advanced/TaskBoard.btsx`):

```btsx
module
  function stagger(instance: ViewTransitionInstance, index: number) {
    for (const part of [instance.group, instance.old, instance.new])
      for (const animation of part.getAnimations())
        animation.effect?.updateTiming({ delay: index * 45, fill: "both" });
  }

ViewTransition(name={`a-task-${task.id}`} update="glide" onUpdate={(instance) => stagger(instance, index)})
  button …
```

You can also skip CSS altogether and call
`instance.new.animate([...], { duration: 300 })`.

### `ref`

`ref` takes a callback ref, an object ref, or an array that combines them. It
receives the boundary's `ViewTransitionInstance`, which is attached in a layout
effect and set back to `null` on unmount. The instance's handles only find
animations while a transition is running. Use the `on*` callbacks when you need
to react at the right moment.

### `scope="element"`

`scope="element"` makes the boundary's single host element a transition root of
its own. Octane marks it with `vt-scope="element"` and runs transitions inside
it through `element.startViewTransition()`, separately from document-wide
transitions. That lets something like a sidebar animate without capturing the
whole page.

- The boundary must wrap exactly one host element and no non-whitespace text.
  Otherwise Octane logs an error in development and commits without animating.
- Boundaries nested inside inherit the scope.
- It needs a browser that supports element-scoped view transitions
  (`Element.prototype.startViewTransition`). Where that's missing, updates in
  the scope simply apply without animation.

None of the demos use it yet.

### `children`

`children` is the content being animated. Its top-level host elements are what
get captured. Text directly inside the boundary isn't captured on its own, so
wrap it in an element.

### Recipes

| Goal | Props |
| --- | --- |
| Morph one element between two layouts | Same `name` in both branches, plus `share="morph"` or `update="glide"` (`ToggleCard.btsx`) |
| Animate list inserts and removals | One `ViewTransition` per item with a unique `name`, plus `enter`, `exit` and `update` (`FilterList.btsx`) |
| Direction-aware slides | `addTransitionType("forward")` plus class maps on `enter` and `exit` (`Routes.btsx`, `Wizard.btsx`) |
| Keep a wrapper still | `update="none"` or `default="none"` on the wrapper |
| Whole-page effect | Set `view-transition-name: root` on `<html>` for that transition, add a type, and target `:root:active-view-transition-type(x)::view-transition-new(root)` (`lib/theme.ts`) |
| Wait for data, then morph | Put the `ViewTransition` *outside* `try`/`pending`, start the update with `useTransition` (`SuspenseProfile.btsx`) |
| Per-item timing | `onUpdate` or `onEnter`, then change `instance.*.getAnimations()` |

### Not in Octane

The notes in `VT_*.md` mention a few APIs that don't exist here:

- **`useViewTransition` / `startViewTransition` hooks:** use `startTransition`.
- **The `mode` prop:** a name plus `update` or `share` covers both "position"
  and "layout" morphs.
- **The `group` and `types` props:** use `default="none"` or `update="none"` for
  grouping, and `addTransitionType` for types.

## Layout

```text
src/
  App.btsx                 shell: header, hero, tier switcher, principles, footer
  components/DemoFrame.btsx  preview/source frame around each example
  demos/{basic,moderate,advanced}/*.btsx   one self-contained example per file
  demos/index.ts           tier and example metadata
  lib/theme.ts             theme context + circular reveal
  lib/highlight.ts         small BTSX highlighter for the source tab
  style.css                tokens, theme, and every ::view-transition-* rule
```

To add an example, create a `.btsx` file under `src/demos/<tier>/` and register
it in `src/demos/index.ts`. Its source shows up in the page on its own through
the `virtual:demo-sources` module in `vite.config.ts`.

## Things to know

- **Transition classes are global CSS.** `enter="pop"` sets
  `view-transition-class: pop`. Style it with `::view-transition-new(*.pop)` in
  `src/style.css`, not in a scoped `style` block.
- **Only on-screen boundaries animate.** Like React, Octane skips boundaries
  that are outside the viewport.
- **The root isn't captured by default.** During a transition Octane sets
  `view-transition-name: none` on `<html>`, so content outside any boundary
  stays live instead of cross-fading. For a whole-page effect, set the root's
  name inline for that one transition, the way `revealTheme` in `lib/theme.ts`
  does.
- **Write Tailwind utilities in `className`, not in selector shorthand.**
  Tailwind's scanner can miss classes in chained shorthand like
  `.relative.h-72.w-56`. Use shorthand only for the classes defined in
  `style.css` (`vt-btn`, `chip`, `eyebrow`).
- **Color tokens use `@theme inline`.** That way the `.light` class on the app
  shell re-themes everything in the same commit, which is what the reveal
  captures.
- **Beast devtools are opt-in.** Start them with `bun run dev:devtools`. While
  they're loaded, most view transitions are skipped: the panel re-renders after
  every app update while Octane is still setting up the transition.
- **The header has a slow-mo switch.** It stretches every transition to 1.8s.

## Octane workaround

`vite.config.ts` includes `patchOctaneInertOwner`, a one-line fix for an Octane
0.4.3 bug. If a subtree that contains nested `<ViewTransition>` boundaries
mounts during a transition, Octane groups those boundaries under the inert
`<template>` document they were cloned from. It then crashes and later updates
stop applying. The plugin fails the build if the target code changes, so after
upgrading Octane, delete it once the upstream fix ships.

Run the full verification before shipping:

```bash
bun run check
```

Record application changes in [CHANGELOG.md](CHANGELOG.md).
