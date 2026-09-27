import type { ComponentBody } from 'octane'

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
import Dashboard from './advanced/Dashboard.btsx'
import ProductMorph from './advanced/ProductMorph.btsx'
import SwipeDeck from './advanced/SwipeDeck.btsx'
import TaskBoard from './advanced/TaskBoard.btsx'
import ThemeReveal from './advanced/ThemeReveal.btsx'
import Wizard from './advanced/Wizard.btsx'
import sources from 'virtual:demo-sources'

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
    intro: 'Wrap the part that changes, start the update with startTransition, and the browser does the rest. Each demo adds exactly one prop.',
    demos: [
      demo('./basic/Counter.btsx', Counter, {
        id: 'counter',
        title: 'Rolling counter',
        blurb: 'An update animation whose class is picked per transition type — digits roll up on +, down on −.',
        apis: ['update', 'addTransitionType', 'class map'],
        origin: 'VT_MOD §1 · text morph'
      }),
      demo('./basic/ToggleCard.btsx', ToggleCard, {
        id: 'toggle-card',
        title: 'Compact ↔ detail',
        blurb: 'Two different layouts share names, so the pill becomes the card instead of being replaced by it.',
        apis: ['name', 'share', 'nested boundaries'],
        origin: 'VT_beast §1 · simple view transition'
      }),
      demo('./basic/Tabs.btsx', Tabs, {
        id: 'tabs',
        title: 'Shared underline',
        blurb: 'The underline unmounts under one tab and mounts under another in the same transition — that is a share.',
        apis: ['share', 'update="fade"'],
        origin: 'VT_MOD §2 · tabs'
      }),
      demo('./basic/Toasts.btsx', Toasts, {
        id: 'toasts',
        title: 'Pop in, pop out',
        blurb: 'A custom class name — pop — styled once in CSS and reused for both enter and exit. Siblings glide into the gap.',
        apis: ['enter', 'exit', 'custom class'],
        origin: 'VT_MOD §7 · custom choreography'
      }),
      demo('./basic/SortList.btsx', SortList, {
        id: 'sort-list',
        title: 'Reorder a list',
        blurb: 'A stable name per row is all it takes for every item to travel to its new slot.',
        apis: ['name per item', 'update'],
        origin: 'VT_beast §3 · list reordering'
      })
    ]
  },
  {
    id: 'moderate',
    index: '02',
    label: 'moderate',
    headline: 'shared elements & direction',
    intro: 'Names that cross components, lists that enter and exit, transitions that know which way they are going, and data that arrives late.',
    demos: [
      demo('./moderate/ExpandCard.btsx', ExpandCard, {
        id: 'expand-card',
        title: 'Magic-move card',
        blurb: 'An outer boundary morphs the frame while nested boundaries fly the art and the title on their own paths.',
        apis: ['share', 'nested names', 'update'],
        origin: 'VT_MOD §3 · expandable card'
      }),
      demo('./moderate/Lightbox.btsx', Lightbox, {
        id: 'lightbox',
        title: 'Gallery → lightbox',
        blurb: 'The thumbnail becomes the full view. A placeholder holds its grid slot so nothing else jumps.',
        apis: ['share', 'enter="rise"', 'object-fit'],
        origin: 'VT_MOD §4 · image gallery'
      }),
      demo('./moderate/FilterList.btsx', FilterList, {
        id: 'filter-list',
        title: 'Filter with enter / exit',
        blurb: 'Each keystroke schedules the list update as a transition: matches rise in, misses sink out, and survivors glide.',
        apis: ['enter', 'exit', 'update', 'empty'],
        origin: 'VT_MOD §5 · filterable list'
      }),
      demo('./moderate/Routes.btsx', Routes, {
        id: 'routes',
        title: 'Directional routes',
        blurb: 'addTransitionType("forward" | "backward") selects which slide the enter and exit class maps resolve to.',
        apis: ['addTransitionType', 'enter map', 'exit map'],
        origin: 'VT_MOD §6 · SPA route transitions'
      }),
      demo('./moderate/SuspenseProfile.btsx', SuspenseProfile, {
        id: 'suspense',
        title: 'Suspense-aware swap',
        blurb: 'The transition holds the old profile while the new one loads, then morphs once — no skeleton flash in between.',
        apis: ['useTransition', 'use()', 'try / pending'],
        origin: 'VT_MOD §8 · async suspense'
      })
    ]
  },
  {
    id: 'advanced',
    index: '03',
    label: 'advanced',
    headline: 'choreography',
    intro: 'Whole-page reveals, multi-element morphs, imperative timing through the instance API, gestures, and transitions run in sequence.',
    demos: [
      demo('./advanced/ThemeReveal.btsx', ThemeReveal, {
        id: 'theme-reveal',
        title: 'Circular theme reveal',
        blurb: 'The whole site flips theme through a clip-path circle that opens from your cursor. Try it — it is not confined to the box.',
        apis: ['addTransitionType', ':active-view-transition-type', 'root'],
        origin: 'VT_MOD §9 · dark mode reveal'
      }),
      demo('./advanced/ProductMorph.btsx', ProductMorph, {
        id: 'product-morph',
        title: 'List → detail, four ways',
        blurb: 'Image, tag, name and price each carry their own shared name, so every fact travels separately into the detail layout.',
        apis: ['share × 4', 'enter / exit', 'types'],
        origin: 'VT_ADV §1 · multi-shared element'
      }),
      demo('./advanced/TaskBoard.btsx', TaskBoard, {
        id: 'task-board',
        title: 'Staggered board',
        blurb: 'onUpdate hands you the ViewTransitionInstance; delaying each card by its index turns a re-sort into a cascade.',
        apis: ['onUpdate', 'ViewTransitionInstance', 'getAnimations'],
        origin: 'VT_ADV §2 · staggered list'
      }),
      demo('./advanced/SwipeDeck.btsx', SwipeDeck, {
        id: 'swipe-deck',
        title: 'Swipe deck',
        blurb: 'Drag past the threshold and the snapshot starts from wherever your finger left it, then flings out in that direction.',
        apis: ['pointer events', 'exit map', 'update'],
        origin: 'VT_ADV §4 · gesture-driven'
      }),
      demo('./advanced/Wizard.btsx', Wizard, {
        id: 'wizard',
        title: 'Onboarding wizard',
        blurb: 'Steps slide by direction while one shared marker travels across the stepper tracks.',
        apis: ['share', 'enter / exit maps', 'addTransitionType'],
        origin: 'VT_MOD §10 · VT_ADV §5'
      }),
      demo('./advanced/Dashboard.btsx', Dashboard, {
        id: 'dashboard',
        title: 'Orchestrated layout',
        blurb: 'Three transitions in sequence — make room, reflow, restore — each awaited before the next begins.',
        apis: ['sequenced transitions', 'activeViewTransition', 'update'],
        origin: 'VT_ADV §6 · nested orchestration'
      })
    ]
  }
]

export const DEMO_COUNT = TIERS.reduce((total, tier) => total + tier.demos.length, 0)
