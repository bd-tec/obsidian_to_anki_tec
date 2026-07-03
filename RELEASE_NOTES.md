# Obsidian_to_Anki_tec 6.0.0

This release turns the fork into a cleaner, more maintainable Obsidian-to-Anki workflow built on top of `Obsidian_to_Anki_Kai` 5.0.8. It keeps the AnkiConnect-based sync model while adding a redesigned settings experience, more precise sync controls, safer relinking behavior, and a structured Markdown parser for readable flashcard notes.

## Highlights

- Redesigned settings UI with tabbed sections, searchable note-type tables, clearer advanced options, and folder pickers for path-based configuration.
- Added current-file and current-folder sync flows so users can sync focused parts of a vault without running a full vault scan.
- Added folder-based rules for default decks and tags, plus additional scan folders and excluded folders for better vault scoping.
- Added a Structured Parser for readable front/back cards using separators or Markdown headings, with configurable field mapping and optional context/link fields.
- Added content-based auto relinking to recover orphaned Anki note IDs and reduce duplicate card creation when IDs are missing or stale.
- Improved tag handling with scan tags, frontmatter tags, hierarchy conversion, and per-note-type required tags for regex-based cards.
- Added cloze editing and reading-view quality-of-life options, including command palette actions, optional context menu actions, and rendered cloze display in Reading View.
- Added frontmatter note ID support for single-note files, keeping source notes cleaner when inline IDs are not desired.

## User-Facing Changes

### Sync Workflow

- New commands for syncing the entire vault, the current file, or the current folder.
- File explorer context menu actions for syncing individual files and folders.
- Better handling of invalid configured scan folders, with notices instead of silent failure.
- Scan filters now respect inline tags and YAML frontmatter tags.

### Settings and Configuration

- Settings are reorganized into focused tabs: General, Tags, Folders, Note Types, Advanced, Actions, and a conditional Parser tab.
- Note-type configuration is easier to manage through searchable tables.
- Folder rules can now be edited with picker-assisted controls instead of manually maintaining raw folder paths everywhere.
- Settings import/export and maintenance actions are documented in the user guide.

### Structured Parser

- Supports separator-based cards such as question/front text followed by a configurable separator and answer/back text.
- Supports heading-based cards where headings become card fronts.
- Supports optional section-to-field mapping for routing sections such as Explanation or Extra into specific Anki fields.
- Supports file link, context, and context link fields when configured.

### Reliability

- Auto Relink by Content can match orphaned source notes back to existing Anki notes instead of creating duplicates.
- Regex compatibility was improved for patterns using PCRE-style end anchors such as `\Z` and `\z`.
- Vault link and context handling was improved for more reliable source references.
- AnkiConnect API key handling and connection errors were clarified.

### Documentation

- Reworked the README for installation, AnkiConnect setup, feature overview, and release links.
- Added a full `FEATURES_GUIDE.md` covering sync commands, tag handling, folder rules, structured parser, advanced options, troubleshooting, and release resources.
- Updated redesign notes to explain the UI direction and parser tab behavior.

## Maintenance

- Bumped plugin metadata to `6.0.0`.
- Aligned release workflow files with the main release flow.
- Pruned obsolete Python-era scripts and legacy generated/config files that are no longer part of this Obsidian plugin release.
- Removed old image assets from the upstream documentation set to keep the fork smaller and focused.
- Removed a tracked backup settings file and added `*.backup` to `.gitignore`.
- Removed personal contact information from the Code of Conduct.
- Removed avoidable debug logging from shipped TypeScript source.

## Compatibility

- Minimum Obsidian app version remains `0.9.20`.
- Desktop only.
- Requires Anki with AnkiConnect installed and running while syncing.

## Upgrade Notes

- Install or update through BRAT using `https://github.com/bd-tec/obsidian_to_anki_tec`, or manually install `main.js`, `manifest.json`, and `styles.css` from the release assets.
- Keep Anki running during sync.
- If using Structured Parser, enable it in Advanced settings and configure the Parser tab before syncing structured notes.
- If using frontmatter note IDs, start with single-note files; multi-note files continue to use inline IDs.

## Base Comparison

Compared against local upstream reference `activefork/master` at `Obsidian_to_Anki_Kai` 5.0.8.
