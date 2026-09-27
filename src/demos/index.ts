import type { ComponentBody } from 'octane'

import sources from 'virtual:demo-sources'
import Dashboard from './advanced/Dashboard.btsx'
import ProductMorph from './advanced/ProductMorph.btsx'
import SwipeDeck from './advanced/SwipeDeck.btsx'
import TaskBoard from './advanced/TaskBoard.btsx'
import ThemeReveal from './advanced/ThemeReveal.btsx'
import Wizard from './advanced/Wizard.btsx'
import Counter from './basic/Counter.btsx'
import SortList from './basic/SortList.btsx'
import Tabs from './basic/Tabs.btsx'
import Toasts from './basic/Toasts.btsx'
import ToggleCard from './basic/ToggleCard.btsx'
import ExpandCard from './moderate/ExpandCard.btsx'
import FilterList from './moderate/FilterList.btsx'
import Lightbox from './moderate/Lightbox.btsx'
import Routes from './moderate/Routes.btsx'
import SuspenseProfile from './moderate/SuspenseProfile.btsx'

export type TierId = 'basic' | 'moderate' | 'advanced'

export interface Demo {
  id: string
  title: string
  blurb: string
  /** The props and APIs this demo leans on — rendered as chips. */
  apis: string[]
  /** Where the pattern comes from in the VT_* guides, or `new` for additions. */
  origin: string
  file: string
  source: string
  component: ComponentBody
}

export interface Tier {
  id: TierId
  index: string
  label: string
  headline: string
  intro: string
  demos: Demo[]
}

const demo = (file: string, component: ComponentBody, meta: Omit<Demo, 'file' | 'source' | 'component'>): Demo => ({
  ...meta,
  file: file.replace('./', 'src/demos/'),
  source: (sources[file] ?? '').trimEnd(),
  component
})

export const TIERS: Tier[] = [
  {
    id: 'basic',
    index: '01',
    label: 'basic',
    headline: 'one boundary, one idea',
    intro:
      'Wrap the part that changes, start the update with startTransition, and the browser does the rest. Each demo adds exactly one prop.',
    demos: [
      demo('./basic/Counter.btsx', Counter, {
        id: 'counter',
        title: 'Counter',
        blurb: 'An update animation whose class is picked per transition type — digits roll up on +, down on −.',
        apis: ['update', 'addTransitionType', 'class map'],
        origin: 'VT_MOD §1 · text morph'
      }),
      demo('./basic/ToggleCard.btsx', ToggleCard, {
        id: 'toggle-card',
        title: 'Card Morph',
        blurb:
          'Two layouts share names, so the pill becomes the card. Only the larger snapshot is drawn, clipped to the moving box, so nothing balloons.',
        apis: ['share', 'addTransitionType', 'grow / unfold', 'nested boundaries'],
        origin: 'VT_beast §1 · simple view transition'
      }),
      demo('./basic/Tabs.btsx', Tabs, {
        id: 'tabs',
        title: 'Tabs',
        blurb:
          'The underline unmounts under one tab and mounts under another — that is a share. The panel nudges the way you travel, picked by transition type.',
        apis: ['share', 'addTransitionType', 'update map'],
        origin: 'VT_MOD §2 · tabs'
      }),
      demo('./basic/Toasts.btsx', Toasts, {
        id: 'toasts',
        title: 'Pop In/Out',
        blurb:
          'A custom class name — pop — styled once in CSS and reused for both enter and exit. Siblings glide into the gap.',
        apis: ['enter', 'exit', 'custom class'],
        origin: 'VT_MOD §7 · custom choreography'
      }),
      demo('./basic/SortList.btsx', SortList, {
        id: 'sort-list',
        title: 'List Reorder',
        blurb:
          'The rows stay put; only their text travels to the new slot. A per-row class adds depth: text moving up lifts over text sinking down.',
        apis: ['name per item', 'update per row', 'image-pair'],
        origin: 'VT_beast §3 · list reordering'
      })
    ]
  },
  {
    id: 'moderate',
    index: '02',
    label: 'moderate',
    headline: 'shared elements & direction',
    intro:
      'Names that cross components, lists that enter and exit, transitions that know which way they are going, and data that arrives late.',
    demos: [
      demo('./moderate/ExpandCard.btsx', ExpandCard, {
        id: 'expand-card',
        title: 'Shuffle Card',
        blurb:
          'One persistent boundary per card updates the frame — unfold, fold or stretch, by its role — while shared art and titles fly on their own paths.',
        apis: ['update per role', 'nested share', 'text-zoom', 'round-*'],
        origin: 'VT_MOD §3 · expandable card'
      }),
      demo('./moderate/Lightbox.btsx', Lightbox, {
        id: 'lightbox',
        title: 'Gallery',
        blurb:
          'The thumbnail grows into the full view as one cropped image while the backdrop fades on its own layer. A placeholder holds the slot so nothing jumps.',
        apis: ['share grow / shrink', 'enter / exit fade', 'round-12'],
        origin: 'VT_MOD §4 · image gallery'
      }),
      demo('./moderate/FilterList.btsx', FilterList, {
        id: 'filter-list',
        title: 'Filter Keyword',
        blurb:
          'Each keystroke schedules the list update as a transition: matches rise in, misses sink out, and survivors glide.',
        apis: ['enter', 'exit', 'update', 'empty'],
        origin: 'VT_MOD §5 · filterable list'
      }),
      demo('./moderate/Routes.btsx', Routes, {
        id: 'routes',
        title: 'Directional Routes',
        blurb:
          'addTransitionType("forward" | "backward") selects which slide the enter and exit class maps resolve to.',
        apis: ['addTransitionType', 'enter map', 'exit map'],
        origin: 'VT_MOD §6 · SPA route transitions'
      }),
      demo('./moderate/SuspenseProfile.btsx', SuspenseProfile, {
        id: 'suspense',
        title: 'Suspense-Aware Swap',
        blurb:
          'The transition holds the old profile while the new one loads. Then the old lines slide away, the portrait irises open with a ring pulse, and the new lines rise one by one.',
        apis: ['useTransition', 'try / pending', 'keyed enter / exit', 'stagger classes'],
        origin: 'VT_MOD §8 · async suspense'
      })
    ]
  },
  {
    id: 'advanced',
    index: '03',
    label: 'advanced',
    headline: 'choreography',
    intro:
      'Whole-page reveals, multi-element morphs, imperative timing through the instance API, gestures, and transitions run in sequence.',
    demos: [
      demo('./advanced/ThemeReveal.btsx', ThemeReveal, {
        id: 'theme-reveal',
        title: 'Circular Theme',
        blurb:
          'The whole site flips theme through a clip-path circle that opens from your cursor. Try it — it is not confined to the box.',
        apis: ['addTransitionType', ':active-view-transition-type', 'root'],
        origin: 'VT_MOD §9 · dark mode reveal'
      }),
      demo('./advanced/ProductMorph.btsx', ProductMorph, {
        id: 'product-morph',
        title: 'List + Detail',
        blurb:
          'Image, tag, name and price each carry their own shared name: the picture grows, the text zooms, the others sink away. Bonus: Add to bag lifts the picture up to the bag’s row, shrinking, then slides it in; the bag bumps as it lands.',
        apis: ['share × 4', 'text-zoom', 'onShare path', 'flushSync', 'bump / late'],
        origin: 'VT_ADV §1 · multi-shared element'
      }),
      demo('./advanced/TaskBoard.btsx', TaskBoard, {
        id: 'task-board',
        title: 'Staggered Board',
        blurb:
          'onUpdate hands you the ViewTransitionInstance; delaying each card by its index turns a re-sort into a cascade.',
        apis: ['onUpdate', 'ViewTransitionInstance', 'getAnimations'],
        origin: 'VT_ADV §2 · staggered list'
      }),
      demo('./advanced/SwipeDeck.btsx', SwipeDeck, {
        id: 'swipe-deck',
        title: 'Swipe Deck',
        blurb:
          'Drag past the threshold and the card flings out from wherever your finger left it. The deck steps forward and a new card grows in from behind — layered explicitly, since snapshots ignore z-index.',
        apis: ['pointer events', 'exit map', 'deck-up / deck-in', 'layering'],
        origin: 'VT_ADV §4 · gesture-driven'
      }),
      demo('./advanced/Wizard.btsx', Wizard, {
        id: 'wizard',
        title: 'Stepper Flow',
        blurb:
          'The step leaves piece by piece — choices, then question — and your answer slips through a portal: out its own left edge, into the list from the right. Back plays it mirrored.',
        apis: ['enter / exit maps', 'w1–w5 waits', 'portal-to / portal-from', 'addTransitionType'],
        origin: 'VT_MOD §10 · VT_ADV §5'
      }),
      demo('./advanced/Dashboard.btsx', Dashboard, {
        id: 'dashboard',
        title: 'Dashboard',
        blurb:
          'Grid, list or table: the same provider panels and text travel to new places, and the table adds columns. Click one for details — its panel unfolds and its facts glide into place. Compact is plain CSS.',
        apis: ['grid / list / table', 'details via share', 'text-zoom', 'CSS width transition'],
        origin: 'VT_ADV §6 · nested orchestration'
      })
    ]
  }
  // {
  //   id: 'hyper',
  //   index: '04',
  //   label: 'hyper',
  //   headline: 'hyper transitions',
  //   intro: 'Hyper transitions',
  //   demos: [
  //     demo('./hyper/MultiDimensional.btsx', MultiDimensional, {
  //       id: 'multi-dimensional',
  //       title: 'Multi-Dimensional',
  //       blurb: 'Pan through space, zoom in, and move between time layers. Each card keeps its place as the scene changes.',
  //       apis: ['4D navigation', 'keyed enter / exit', 'glide'],
  //       origin: 'new'
  //     })
  //   ]
  // }
]

export const DEMO_COUNT = TIERS.reduce((total, tier) => total + tier.demos.length, 0)
