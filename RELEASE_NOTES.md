# Obsidian_to_Anki_tec 6.0.0

## What's Changed

### New Features

- Redesigned settings UI with tabs, searchable note-type tables, clearer sections, and folder pickers.
- Added sync commands for current file, current folder, and entire vault.
- Added file and folder context menu actions for faster targeted syncing.
- Added Structured Parser support for separator-based and heading-based Markdown cards.
- Added configurable Structured Parser field mapping for front, back, file link, context, context link, and custom sections.
- Added folder deck rules, folder tag rules, additional scan folders, and excluded folders.
- Added frontmatter tag support, Anki hierarchy tag conversion, and required tags per note type.
- Added frontmatter note ID support for single-note files.
- Added cloze add/remove commands and optional editor context menu actions.
- Added optional Reading View cloze rendering and highlighted cloze rendering.

### Improvements

- Improved AnkiConnect setup guidance and connection error messages.
- Improved source link, vault link, and context reliability.
- Added content-based auto relinking to reduce duplicate cards from stale or missing note IDs.
- Improved regex compatibility for PCRE-style end anchors such as `\Z` and `\z`.
- Improved scan filtering with support for inline tags and YAML frontmatter tags.
- Improved settings layout for large note-type and folder-rule configurations.

### Documentation

- Reworked README setup and feature overview.
- Added `FEATURES_GUIDE.md` with detailed documentation for sync commands, tags, folder rules, Structured Parser, advanced options, and troubleshooting.
- Updated redesign notes for the new settings layout and conditional Parser tab.
- Added structured release notes for `6.0.0`.

### Maintenance

- Updated plugin metadata to `6.0.0`.
- Added release-ready bundled assets.
- Removed obsolete Python-era files and old generated/config files.
- Removed unused upstream documentation image assets.
- Removed tracked backup files and added `*.backup` to `.gitignore`.
- Removed personal contact information from project docs.
- Removed avoidable debug logging from shipped TypeScript source.
- Disabled Dependabot branch generation to keep the repository branch list clean.

## Requirements

- Obsidian desktop.
- Anki desktop.
- AnkiConnect installed in Anki.
- Anki must be running while syncing.

## Release Assets

- `main.js`
- `manifest.json`
- `styles.css`
- `obsidian-to-anki-plugin-6.0.0.zip`

**Full Changelog:** https://github.com/bd-tec/obsidian_to_anki_tec/compare/5.0.8...6.0.0
