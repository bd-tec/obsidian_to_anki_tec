# Feature Notes

This document is the detailed user-facing reference for `Obsidian_to_Anki_tec`.

It covers what the fork adds, how the features behave, and how to use the major options in practice.

For design intent and UI redesign background, see [REDESIGN_NOTES.md](./REDESIGN_NOTES.md).

## First-Time Sync Setup

Before any sync can work, Obsidian must be able to talk to Anki through AnkiConnect.

⚠️ Required:

- Anki desktop app
- [AnkiConnect](https://ankiweb.net/shared/info/2055492159) installed in Anki
- Anki running in the background while syncing

### AnkiConnect setup

1. Open Anki.
2. Choose the Anki profile you want this plugin to use.
3. Install AnkiConnect if it is not already installed.
4. In Anki, open **Tools -> Add-ons -> AnkiConnect -> Config**.
5. Use this config:

```json
{
  "apiKey": null,
  "apiLogPath": null,
  "webBindAddress": "127.0.0.1",
  "webBindPort": 8765,
  "webCorsOrigin": "http://localhost",
  "webCorsOriginList": [
    "http://localhost",
    "app://obsidian.md"
  ]
}
```

6. Restart Anki.
7. Keep Anki open.
8. Enable or reload the Obsidian plugin.
9. Run a sync from Obsidian.

💡 After this first setup, Anki only needs to be open when you sync. You can open Obsidian without Anki for normal note-taking.

🔐 If you enable an API key in AnkiConnect, enter the same key in the plugin's Advanced settings. If AnkiConnect does not use a key, leave the plugin API key setting blank.

## Sync and Workflow Features

The fork adds more direct sync actions beyond the original full-vault flow:

- Sync Current File
- Sync Current Folder
- Sync Entire Vault
- file and folder context-menu integration

These are useful when you want to sync only what you are actively working on instead of scanning the full vault every time.

## Field Control and General Additions

### Per-note-type field control

You can configure these features per Anki note type:

- Add File Link
- Add Context
- Add Aliases

When enabled globally, matching columns appear in the **Note Types** tab. Each note type can then choose a target field or `None`.

### Add File Link

The plugin can append a normal Obsidian file link to a chosen Anki field.

💡 Typical use:

- keep a link back to the source note inside Anki
- choose a different target field per note type
- disable it for note types where it is not useful

### Add File Link label customization

The file-link text is configurable.

- Use `{{title}}` to insert the note filename
- Example: `Source: {{title}}`
- If left blank, the default label is `Obsidian`

### Add Context

The plugin can append card context to a field in the form:

`path > heading > heading`

This is useful when you want to preserve where the note content came from inside the vault structure.

### Add Aliases

Aliases from frontmatter can be appended to a selected field for each note type.

Multiple aliases are separated with `<br>`.

### Configurable CurlyCloze keyword

The note-type keyword for CurlyCloze is configurable instead of being hardcoded to `Cloze`.

This supports localized note type names such as `穴埋め`.

### Smart Scan toggle

Smart Scan skips unchanged files using MD5 hashes.

- enabled: only changed files are scanned
- disabled: full re-scan behavior

## Tag and Scan Controls

### Tag support improvements

Inline tag support was extended to better handle:

- Unicode tags such as `#重要`
- nested tags such as `#parent/child`
- hyphenated tags such as `#my-tag`

### Frontmatter tags

The fork can also send tags from Obsidian YAML frontmatter to Anki.

Supported shapes include:

- list form
- array form

These tags are added on top of existing inline or default tags.

### Convert to Anki hierarchy

Slash-separated tags can be converted into Anki hierarchy format.

- Obsidian: `#japanese/grammar`
- Anki: `japanese::grammar`

This applies to both inline tags and frontmatter tags.

### Scan Tags

You can restrict vault scanning to files that contain matching tags.

- supports inline tags and frontmatter tags
- enter tags as a comma-separated list
- leave empty to scan everything in the selected scan directory

⚠️ Important note:

- this applies to vault scan and auto scan
- right-click file sync still force-syncs the selected file

### Regex Required Tags

This lets a custom regex apply only when the file contains specific tags.

💡 Use case:

- generic regex for one note type
- stricter tagged regex for another note type such as reverse cards

Behavior:

1. Enable `Regex Required Tags` in Advanced.
2. A `Required Tags` column appears in **Note Types**.
3. Enter comma-separated tags.
4. That regex only applies if at least one of those tags is present.

Priority behavior:

- rules with required tags are processed first
- tagged matches use the strict rule
- non-matching files fall back to generic rules

### Ignored files and folders

Ignored file patterns use glob syntax, one per line.

🧩 Useful examples:

```text
**/*.excalidraw.md
Templates/**
**/private/**
```

## Structured Parser

The structured parser is for users who prefer readable Markdown flashcards instead of maintaining one large custom regex.

### Basic setup

🛠️ Recommended setup:

- enable `Structured Parser`
- choose an Anki note type such as `Basic`
- keep `Front Back Separator` as `#flashcard`
- keep `Card End Marker` as `---`

⚠️ How to disable it:

- open `Advanced`
- turn off `Enable Structured Parser`
- the dedicated parser tab disappears, but saved parser settings remain stored

### Basic example

```md
What is the capital of France?

#flashcard

Paris

---
```

Behavior:

- everything before `#flashcard` goes to the front field
- everything after it goes to the back field
- `---` ends the card

### Multiple cards in one note

```md
What is the capital of France?

#flashcard

Paris
---

What is the capital of Japan?

#flashcard

Tokyo
---
```

### Section Field Map

You can keep the main answer in the back field and route labeled sections into other Anki fields.

🧩 Example note:

```md
What is the treatment of choice for anaphylaxis?

#flashcard

Intramuscular epinephrine.

**Explanation**
Give IM epinephrine early in the lateral thigh. Airway, oxygen, IV fluids, and monitoring are also important.

**Ref**
Emergency guideline summary
---
```

Rule behavior:

- without a section map, everything after the separator stays in the back field
- with a section map, labeled sections such as `Explanation` or `Ref` can be redirected to other fields

Saved rule format:

```text
Label in note=Anki field name
```

🧩 Example:

```text
Explanation=Extra
Ref=Source
```

Meaning:

- `Explanation` is the section label written in the note
- `Extra` is the Anki field that receives that section
- `Ref` is the section label written in the note
- `Source` is the Anki field that receives that section

🛠️ Typical setup:

1. Make sure the target note type contains the fields you want.
2. Example fields: `Front`, `Back`, `Extra`, `Source`
3. Open `Structured Parser - Section Field Map`
4. Add mappings such as `Explanation=Extra` and `Ref=Source`.

Result:

- question text goes to `Front`
- main answer goes to `Back`
- the `Explanation` block goes to `Extra`
- the `Ref` block goes to `Source`

This is useful when you want:

- a short answer on the card back
- longer teaching notes in another field
- cleaner cards without losing context

### Structured Parser auto fields

The structured parser can also fill optional extra fields:

- `File Link Field` for a normal Obsidian file link
- `Context Field` for the text path/context
- `Context Link Field` for an exact card link using Advanced URI

The `Context Link Field` is the Advanced URI option.

💡 What it does:

- creates an exact deep link back to the generated card location
- uses the note block ID created for that card, such as `anki-<id>`
- is more precise than a normal file link because it points to the specific card block, not just the note

⚠️ Important:

- this requires the extra Advanced URI plugin to work properly
- without that plugin, the normal `File Link Field` is the simpler option

🔗 Advanced URI plugin:

- [Obsidian Advanced URI](https://community.obsidian.md/plugins/obsidian-advanced-uri)

## ID Handling and Advanced Features

### Note ID generation and storage

The plugin generates and manages Anki note IDs so synced notes can be matched and updated later instead of being duplicated.

By default, IDs are stored inline in the note. Depending on settings, they may appear as:

- plain `ID: ...` lines
- HTML-comment-wrapped IDs when `ID Comments` is enabled

The `ID Comments` setting keeps the ID in the note while making it less visually intrusive.

### Save Note ID to Frontmatter

Stores the Anki note ID (`nid`) in YAML frontmatter instead of inline comments or block IDs.

⚠️ Important behavior:

- this only applies cleanly when a file corresponds to a single Anki note
- files containing multiple notes still use inline IDs

### Bulk Delete IDs

Lets you delete all Anki IDs associated with a file.

🛠️ Usage:

1. Enable `Bulk Delete IDs`
2. Right-click a Markdown file
3. Choose `Delete all IDs in file`

💡 Effect:

- deletes matching notes/cards in Anki
- removes ID lines from the Obsidian file
- preserves the rest of the note content

⚠️ This is destructive to Anki data and should be treated carefully.

### Reading View cloze renderer

Enhances how cloze syntax appears in Obsidian Reading View.

- `{{c1::answer::hint}}` can render as plain answer text
- optional highlight mode uses Obsidian-style highlighting

### Cloze deletion context menu and hotkeys

Adds commands and optional context-menu actions for creating or removing Anki clozes from selected editor text.

Commands:

- `Add Anki Cloze`
- `Remove Anki Cloze`

Behavior:

- selected text becomes `{{c<N>::text}}`
- cloze numbering fills gaps or increments from the highest current cloze number

### AnkiConnect API key

Supports sending an API key with AnkiConnect requests when authentication is enabled in AnkiConnect.

Leave blank if your AnkiConnect setup does not require a key.

## Stability Improvements

Important fixes in this fork include:

- note-type field regeneration now refreshes field definitions correctly
- extra newline insertion around regex note IDs was cleaned up
- newline handling for file links, aliases, and context is more consistent
- selected fields are validated after regeneration and fall back safely when needed

## References

- [REDESIGN_NOTES.md](./REDESIGN_NOTES.md)
- [Upstream Obsidian_to_Anki wiki](https://github.com/Pseudonium/Obsidian_to_Anki/wiki)
- [Latest releases for this fork](https://github.com/bd-tec/obsidian_to_anki_tec/releases/latest)
