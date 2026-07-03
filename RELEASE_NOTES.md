# Obsidian_to_Anki_tec 6.0.0

First public release of `Obsidian_to_Anki_tec`, a maintained fork of `Obsidian_to_Anki_Kai` focused on cleaner settings, safer syncing, and more flexible Markdown-to-Anki card creation.

Base: `Obsidian_to_Anki_Kai` 5.0.8  
Version: `6.0.0`  
Minimum Obsidian version: `0.9.20`  
Platform: Desktop only

## Quick Install

### Option 1: Install with BRAT

1. Install BRAT from Obsidian Community Plugins.
2. Open BRAT settings.
3. Choose `Add Beta plugin`.
4. Add this repository:

```text
https://github.com/bd-tec/obsidian_to_anki_tec
```

5. Enable `Obsidian_to_Anki_tec` from Obsidian Community Plugins.
6. Restart or reload Obsidian if the plugin does not appear immediately.

### Option 2: Manual Install

1. Download these release assets:

- `main.js`
- `manifest.json`
- `styles.css`

2. Create this folder inside your vault:

```text
<Vault>/.obsidian/plugins/obsidian-to-anki-plugin/
```

3. Place the three files in that folder.
4. Reload Obsidian.
5. Enable `Obsidian_to_Anki_tec`.

## Required Anki Setup

Before syncing, Anki must be able to receive requests from Obsidian.

1. Install Anki desktop.
2. Install the AnkiConnect add-on.
3. Open Anki and keep it running while syncing.
4. In Anki, open `Tools -> Add-ons -> AnkiConnect -> Config`.
5. Make sure Obsidian is allowed in AnkiConnect CORS settings.
6. Restart Anki after changing AnkiConnect settings.

## Release Highlights

- Redesigned settings UI with organized tabs, searchable note-type tables, and folder pickers.
- New sync commands for current file, current folder, and full vault sync.
- New Structured Parser for readable Markdown flashcards.
- Better folder rules for decks, tags, additional scan folders, and excluded folders.
- Safer relinking to reduce duplicate cards when old note IDs become stale.
- Improved tag handling for inline tags, YAML frontmatter tags, and Anki hierarchy conversion.
- Better cloze editing tools and optional cloze rendering in Reading View.
- Expanded documentation with a full feature guide.

## New Features

### Settings UI

- Added tabbed settings sections:
- General
- Tags
- Folders
- Note Types
- Advanced
- Actions
- Parser

- Added searchable note-type configuration tables.
- Added folder picker controls for path-based settings.
- Added clearer grouping for advanced and experimental features.

### Sync Commands

- `Sync Entire Vault`
- `Sync Current File`
- `Sync Current Folder`

The file explorer context menu also supports direct file and folder sync.

### Structured Parser

The new Structured Parser lets you write more readable Markdown cards without relying only on custom regex patterns.

Supported modes:

- Separator-based cards
- Heading-based cards

Configurable fields:

- Front field
- Back field
- File link field
- Context field
- Context link field
- Section-to-field mapping

Example separator workflow:

```markdown
What is the capital of Bangladesh? ? #flashcard
Dhaka
---
```

### Folder Rules

Folder configuration is now easier to manage.

Added support for:

- Folder deck rules
- Folder tag rules
- Additional scan folders
- Excluded folders

### Tags and Metadata

- Added YAML frontmatter tag support.
- Added inline tag scanning improvements.
- Added slash-to-Anki-hierarchy conversion.
- Added per-note-type required tags for regex extraction.
- Added optional frontmatter note ID storage for single-note files.

### Cloze Tools

- Added command palette actions for adding Anki cloze markup.
- Added command palette actions for removing Anki cloze markup.
- Added optional editor context menu support.
- Added optional Reading View cloze rendering.
- Added optional highlighted Reading View cloze rendering.

## Improvements

### Reliability

- Added content-based auto relinking for orphaned note IDs.
- Reduced accidental duplicate card creation when note IDs are stale or missing.
- Improved source link and context handling.
- Improved error messages for AnkiConnect connection problems.

### Regex Compatibility

- Improved compatibility for PCRE-style end anchors:
- `\Z`
- `\z`

### Documentation

- Reworked the README.
- Added `FEATURES_GUIDE.md`.
- Updated redesign notes.
- Added clearer setup, sync, and troubleshooting guidance.

## Maintenance Changes

- Updated plugin metadata to `6.0.0`.
- Added release-ready bundled assets.
- Removed obsolete Python-era files.
- Removed old generated/config files that are no longer part of the maintained plugin.
- Removed unused old documentation images.
- Removed a tracked backup settings file.
- Added `*.backup` to `.gitignore`.
- Removed personal contact information from the Code of Conduct.
- Removed avoidable debug logging from shipped TypeScript source.

## Upgrade Notes

- Keep Anki open whenever you sync.
- If using Structured Parser, enable it in Advanced settings first, then configure the Parser tab.
- If using frontmatter note IDs, start with single-note files.
- Multi-note files continue to use inline IDs.
- Review folder rules after upgrade if your vault uses multiple Anki note locations.

## Known Requirements

- Obsidian desktop only.
- AnkiConnect is required for sync.
- Anki must be running during sync.
- Manual install requires `main.js`, `manifest.json`, and `styles.css`.

## Release Assets

This release should include:

- `main.js`
- `manifest.json`
- `styles.css`
- `obsidian-to-anki-plugin-6.0.0.zip`
