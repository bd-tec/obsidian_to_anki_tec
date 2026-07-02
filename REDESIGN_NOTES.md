# Redesign Notes

This document explains the design direction of `Obsidian_to_Anki_tec`: why the settings UI changed, how the sync workflow was improved, and what major UX decisions shaped the fork.

For detailed feature behavior and setup instructions, see [FEATURES_GUIDE.md](./FEATURES_GUIDE.md).

## Design Goals

Main goals:

- reduce friction in plugin settings
- make common sync flows faster and easier to discover
- improve per-note-type control without breaking older workflows
- add practical quality-of-life improvements while keeping the plugin familiar

## Settings Redesign

The major settings redesign is based on [PR #673](https://github.com/ObsidianToAnki/Obsidian_to_Anki/pull/673) by [n4tt0u](https://github.com/n4tt0u/Obsidian_to_Anki_Kai).

Key changes:

- tab-based settings navigation
- searchable tables for Note Types and Folders
- folder picker support for path-based configuration
- import/export settings support
- clearer grouping for advanced and experimental options

Why this matters:

- the old settings surface was dense and harder to scan
- note-type and folder configuration now scale better as setups grow
- users can reach the right setting faster without reading a long page top to bottom

## Sync Workflow Improvements

The fork expands the original full-vault workflow with more direct, context-based sync entry points.

Design intent:

- reduce unnecessary full-vault scans
- support “sync what I am working on right now”
- make sync actions easier to reach from the current context

For the actual commands and user-facing behavior, see [FEATURES_GUIDE.md](./FEATURES_GUIDE.md#sync-commands).

## Feedback and Status Improvements

The redesign also improves user feedback during sync:

- progress modal with real-time status
- status bar sync indicator
- clearer notices and error messages
- smarter change detection for better performance on larger vaults

These changes were meant to make the plugin feel more responsive and less opaque during sync operations.

## Feature-Specific UI Decisions

Some features gained dedicated or more explicit UI because their previous shape was hard to understand.

Examples:

- conditional `Parser` tab for Structured Parser settings
- clearer placement of advanced and experimental toggles
- better separation between common settings and advanced behavior

The Structured Parser tab is intentionally conditional:

- `Enable Structured Parser` stays in `Advanced`
- the dedicated parser tab only appears when the feature is enabled
- detailed parser behavior and setup live in [FEATURES_GUIDE.md](./FEATURES_GUIDE.md#structured-parser)

## Scope of This Document

This file focuses on:

- why the plugin UX changed
- what major settings and sync design changes were introduced
- how the fork tries to improve usability

This file does not try to be the full user manual. For feature behavior, examples, parser setup, ID handling, tags, links, and advanced options, use [FEATURES_GUIDE.md](./FEATURES_GUIDE.md).

## References

- [FEATURES_GUIDE.md](./FEATURES_GUIDE.md)
- [REDESIGN_NOTES](https://github.com/n4tt0u/Obsidian_to_Anki_Kai/blob/master/REDESIGN_NOTES.md)
- [Upstream Obsidian_to_Anki wiki](https://github.com/Pseudonium/Obsidian_to_Anki/wiki)
- [Latest releases for this fork](https://github.com/bd-tec/obsidian_to_anki_tec/releases/latest)
- [Settings redesign PR #673](https://github.com/ObsidianToAnki/Obsidian_to_Anki/pull/673)
