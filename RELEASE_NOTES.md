# Obsidian_to_Anki_tec 6.0.0

`6.0.0` is the first public release of `Obsidian_to_Anki_tec`, a maintained fork of `Obsidian_to_Anki_Kai` focused on a cleaner Obsidian settings experience, safer sync behavior, and more flexible Markdown-to-Anki workflows.

This release is based on `Obsidian_to_Anki_Kai` 5.0.8 and keeps the existing AnkiConnect sync model.

## What changed

### Redesigned settings experience

- Rebuilt the settings screen around focused tabs for General, Tags, Folders, Note Types, Advanced, Actions, and Parser settings.
- Added searchable note-type tables so large Anki setups are easier to manage.
- Added folder pickers and structured folder rule editors for scan folders, excluded folders, folder decks, and folder tags.
- Moved advanced and experimental options into clearer sections.

### More focused sync workflows

- Added commands for syncing the current file, current folder, or entire vault.
- Added file explorer context menu actions for syncing a single Markdown file or folder.
- Added safer handling for invalid scan folders, with user-facing notices instead of silent failures.
- Improved scan filtering with support for inline tags and YAML frontmatter tags.

### Structured Parser

- Added a new Structured Parser for readable Markdown flashcards.
- Supports separator-based cards, for example front text followed by a configurable `? #flashcard` separator.
- Supports heading-based cards where Markdown headings become card fronts.
- Supports configurable front/back fields, file link fields, context fields, context link fields, and section-to-field routing.
- Parser settings appear in a dedicated Parser tab only when Structured Parser is enabled.

### Tag and field control

- Added frontmatter tag sync.
- Added Anki hierarchy conversion for slash-separated tags.
- Added per-note-type required tags for regex-based card extraction.
- Added alias fields, context fields, and file link field controls per note type.

### Reliability and duplicate prevention

- Added content-based auto relinking for orphaned Anki note IDs.
- Improved handling for stale or missing note IDs to reduce accidental duplicate card creation.
- Improved compatibility for PCRE-style regex end anchors such as `\Z` and `\z`.
- Improved vault link and context handling for more reliable source references.
- Clarified AnkiConnect API key setup and connection error messages.

### Cloze and editing quality-of-life

- Added command palette actions for adding and removing Anki cloze markup.
- Added optional editor context menu support for cloze creation/removal.
- Added optional Reading View rendering for cloze text.
- Added optional highlighted Reading View cloze rendering.

### Documentation

- Reworked the README for installation, AnkiConnect setup, feature overview, and release links.
- Added `FEATURES_GUIDE.md` with detailed user-facing documentation for sync commands, tag handling, folder rules, Structured Parser, advanced options, troubleshooting, and release resources.
- Updated redesign notes to document the UI direction and parser tab behavior.

## Maintenance

- Bumped plugin metadata to `6.0.0`.
- Added release-ready bundled plugin assets.
- Removed obsolete Python-era files and legacy generated/config files from the maintained plugin core.
- Removed old upstream documentation image assets that are no longer used by this fork.
- Removed a tracked backup settings file and added `*.backup` to `.gitignore`.
- Removed personal contact information from the Code of Conduct.
- Removed avoidable debug logging from shipped TypeScript source.

## Installation

### BRAT

1. Install BRAT from Obsidian Community Plugins.
2. Add this beta plugin repository:

```text
https://github.com/bd-tec/obsidian_to_anki_tec
```

3. Enable `Obsidian_to_Anki_tec` in Obsidian.

### Manual install

Download these release assets and place them in:

```text
<Vault>/.obsidian/plugins/obsidian-to-anki-plugin/
```

Required files:

- `main.js`
- `manifest.json`
- `styles.css`

## Requirements

- Obsidian desktop.
- Minimum Obsidian app version: `0.9.20`.
- Anki desktop with AnkiConnect installed.
- Anki must be running while syncing.

## Upgrade notes

- If using Structured Parser, enable it in Advanced settings and configure the Parser tab before syncing structured notes.
- If using frontmatter note IDs, start with single-note files. Multi-note files continue to use inline IDs.
- Keep Anki open during sync so AnkiConnect can receive requests.

## Base comparison

Compared against local upstream reference `activefork/master` at `Obsidian_to_Anki_Kai` 5.0.8.
