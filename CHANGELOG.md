# Changelog

All notable changes to `view-transition` will be recorded here.

## [Unreleased]

### Added

- ViewTransition showcase site in the okc.media mood: charcoal/paper themes, large type, fixed header with a slow-mo switch and a circular theme toggle.
- Sixteen live examples across three tiers (basic, moderate, advanced), each a self-contained `.btsx` file shown next to its highlighted source.
- Directional tier switching driven by `addTransitionType`, with a shared underline.
- Principles section summarising the VT_* best-practice notes.
- `virtual:demo-sources` Vite module that exposes example source as strings.

### Changed

- README: full `ViewTransition` prop reference — class-value resolution, triggers, callbacks and instance API, `ref`, `scope`, recipes.

- Beast devtools and Octane profiling load only with `BEAST_DEVTOOLS=1` (`bun run dev:devtools`). Loading them makes Octane skip most view transitions.

### Fixed

- Worked around an Octane 0.4.3 bug where nested `<ViewTransition>` boundaries inside mounting content crash the runtime (`patchOctaneInertOwner` in `vite.config.ts`).
