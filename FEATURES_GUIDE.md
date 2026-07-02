# Features Guide

This document is the user-facing guide for `Obsidian_to_Anki_tec`.

It explains where to enable each feature, what it does, and how to use it in practice.

For UI redesign background, see [REDESIGN_NOTES.md](./REDESIGN_NOTES.md).

## First-Time Sync Setup

Before any sync can work, Obsidian must be able to talk to Anki through AnkiConnect.

⚠️ Required:

- Anki desktop app
- [AnkiConnect](https://ankiweb.net/shared/info/2055492159) installed in Anki
- Anki running in the background while syncing

### AnkiConnect setup

1. Open Anki.
2. Choose the Anki profile you want to sync with.
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
8. Enable or reload the Obsidian plugin in Obsidian.
9. Run a sync from Obsidian.

💡 After first-time setup, Anki only needs to be open when you sync. You can use Obsidian normally without Anki running.

## Sync Commands

### Sync Current File

Enable: No extra toggle is required. Use the command after the plugin is installed and connected to Anki.

⚠️ Strongly recommended:

- use this as the default sync action when working on one note
- it is the safest option because it limits changes to the file you are actively editing

Usage:

- sync only the note you are currently editing
- useful when testing one card file
- faster than scanning the whole vault

### Sync Current Folder

Enable: No extra toggle is required. Use the command after the plugin is installed and connected to Anki.

Usage:

- sync all supported notes in the current folder
- useful when one topic or chapter is split across several files
- avoids a full-vault scan

### Sync Entire Vault

Enable: No extra toggle is required. This is the normal full scan workflow.

Usage:

- scans the configured vault content
- best when you changed many notes across different folders
- respects your scan filters such as ignored paths and scan tags

### File and folder context menu

Enable: No separate toggle is required for the sync actions themselves.

Usage:

- right-click a file to sync that file directly
- right-click a folder to sync that folder directly
- useful when you prefer the file explorer over the command palette

## General Features

### Add File Link

You can append a normal Obsidian file link to an Anki field.

Enable: Go to **Settings -> General -> Add File Link**. Then open **Note Types** and choose the target field in the `File Link Field` column for each note type.

Usage:

- adds a link back to the source note in Obsidian
- you can choose a different target field for each note type
- set the field to `None` for note types where you do not want the link

### Add File Link - Link Label

This controls the text shown for the file link.

Enable: Turn on **Add File Link** first. Then edit **Settings -> General -> Add File Link - Link Label**.

Usage:

- use `{{title}}` to insert the note filename
- example: `Source: {{title}}`
- if left blank, the default label is `Obsidian`

### Add Context

You can append context text such as `path > heading > heading` to an Anki field.

Enable: Go to **Settings -> General -> Add Context**. Then open **Note Types** and choose the target field in the `Context Field` column.

Usage:

- shows where the card came from inside the vault
- useful when one note contains many cards under different headings
- set the field to `None` for note types where context is not needed

### Add Aliases

You can append YAML aliases from the note into an Anki field.

Enable: Go to **Settings -> General -> Add Aliases**. Then open **Note Types** and choose the target field in the `Aliases Field` column.

Usage:

- sends frontmatter aliases to Anki
- multiple aliases are joined with `<br>`
- useful for synonyms, alternate names, and search terms

### CurlyCloze

CurlyCloze converts `{text}` into Anki cloze format for matching note types.

Enable: Go to **Settings -> General -> CurlyCloze**.

Usage:

- turns `{example}` into `{{c1::example}}`
- useful if you prefer lightweight Markdown while writing
- only applies to note types whose name matches your configured cloze keyword

### CurlyCloze - Keyword

This controls which note types CurlyCloze should treat as cloze note types.

Enable: Turn on **CurlyCloze** first. Then edit **Settings -> General -> CurlyCloze - Keyword**.

Usage:

- default is `Cloze`
- change it if your Anki cloze note type uses another word
- useful for localized note type names such as `穴埋め`

### CurlyCloze - Highlights to Clozes

This converts Obsidian highlights into CurlyCloze input.

Enable: Turn on **CurlyCloze** first. Then enable **Settings -> General -> CurlyCloze - Highlights to Clozes**.

Usage:

- turns `==highlight==` into `{highlight}`
- that result is then processed by CurlyCloze
- useful if you already write highlighted text in your notes

### ID Comments

This wraps synced Anki IDs in HTML comments instead of leaving them visible as plain text.

Enable: Go to **Settings -> General -> ID Comments**.

Usage:

- keeps the note ID stored in the file
- makes the ID less visually distracting in editing view
- useful if you want cleaner Markdown while still keeping sync IDs inline

## Tags and Scan Controls

### Add Inline Tags

This sends inline Obsidian tags to Anki.

Enable: Go to **Settings -> Tags -> Add Inline Tags**.

Usage:

- sends tags such as `#anki`, `#important`, or `#topic/subtopic`
- supports Unicode tags such as `#重要`
- supports nested tags and hyphenated tags

### Add Frontmatter Tags

This sends YAML frontmatter tags to Anki.

Enable: Go to **Settings -> Tags -> Add Frontmatter Tags**.

Usage:

- reads the `tags:` section in frontmatter
- works with list-style and array-style tags
- adds these tags on top of any inline or default tags

### Convert to Anki Hierarchy

This converts slash-separated tags into Anki's hierarchical tag format.

Enable: Go to **Settings -> Tags -> Convert to Anki Hierarchy**.

Usage:

- `#japanese/grammar` becomes `japanese::grammar`
- applies to both inline tags and frontmatter tags
- useful if you want your Obsidian tag structure to carry into Anki

### Scan Tags

This limits vault scans to files that contain specific tags.

Enable: Go to **Settings -> Tags -> Scan Tags** and enter tags separated by commas.

Usage:

- only files with at least one matching tag are included in vault scans
- leave it blank to scan everything in the scan directory
- works with both inline tags and frontmatter tags

⚠️ Important:

- this affects vault scan and auto scan
- right-click file sync still force-syncs the selected file

### Ignored Files and Folders

This excludes matching paths from scans.

Enable: Go to **Settings -> General -> Ignored Files & Folders** and add glob patterns, one per line.

Usage:

- skip files such as `**/*.excalidraw.md`
- skip folders such as `Templates/**`
- useful for templates, scratch notes, or private folders

Example:

```text
**/*.excalidraw.md
Templates/**
**/private/**
```

## Note Type Table Features

### Per-note-type field control

Some features become configurable per Anki note type after you enable them globally.

Enable: Turn on **Add File Link**, **Add Context**, **Add Aliases**, or **Regex Required Tags** first. Then open **Settings -> Note Types**.

Usage:

- extra columns appear only for the enabled features
- each note type can use a different target field
- you can also choose `None` to disable that feature for one note type only

### Regex Required Tags

This lets a custom regex apply only when the file contains specific tags.

Enable: Go to **Settings -> Advanced -> Regex Required Tags**. Then open **Settings -> Note Types** and use the `Required Tags` column.

Usage:

- enter comma-separated tags for a regex row
- that regex only applies when at least one of those tags is present
- useful when the same general note structure should map to different note types depending on tags

Example:

- one regex row for normal cards
- another regex row for reverse cards with a tag such as `#reverse`

Behavior:

- rules with required tags are checked first
- matching files use the tagged rule
- non-matching files fall back to more general regex rows

## Structured Parser

The structured parser is for users who want readable Markdown flashcards instead of one large custom regex.

### Enable Structured Parser

Enable: Go to **Settings -> Advanced -> Enable Structured Parser**. This opens the `Parser` tab automatically.

Usage:

- enables the dedicated parser settings tab
- keeps your parser settings saved even if you later turn it off
- to disable it, return to **Advanced** and turn off **Enable Structured Parser**

Warning: `⚠️` The structured parser takes over only for the note type selected in `Parser -> Note Type`. For that selected note type, the old custom regex row in `Note Types` is skipped, so regex-based field behavior for that note type will not run. Use the parser's own `Front Field`, `Back Field`, `File Link Field`, `Context Path`, and `Exact Card Link Field` settings instead.

### Note Type

This chooses which Anki note type the structured parser should create.

Enable: Open **Settings -> Parser -> Note Type** after the parser is enabled.

Usage:

- choose the Anki note type you want to create
- that chosen note type becomes the one controlled by the structured parser
- after you choose a note type, the parser field dropdowns are populated from that note type
- if you leave field selections blank, the parser can fall back to the first and second fields automatically

### Front Field and Back Field

These choose where the main card content goes.

Enable: Open **Settings -> Parser -> Front Field** and **Back Field**.

Usage:

- `Front Field` receives everything before the separator
- `Back Field` receives the main answer section after the separator
- leave them on `Auto` if your note type uses a normal front/back order

### Card Source

This chooses how the structured parser detects each card.

Enable: Open **Settings -> Parser -> Card Source**.

Usage:

- `Separator` uses the `Front/Back Separator` text inside each card
- `Heading` uses a Markdown heading as the front and everything after it as the back until the card end marker
- choose `Heading` if your cards look like `## Question` followed by the answer body

### Front/Back Separator

This is the text that splits the front from the back.

Enable: Open **Settings -> Parser -> Front/Back Separator**.

Usage:

- only used when `Card Source` is set to `Separator`
- default style is based on `#flashcard`
- everything before the separator becomes the front
- everything after the separator becomes the back until the card end marker

Basic example:

```md
What is the capital of France?

? #flashcard

Paris

---
```

### Heading Level

This chooses which Markdown heading level becomes the front when using heading mode.

Enable: Open **Settings -> Parser -> Heading Level**.

Usage:

- only used when `Card Source` is set to `Heading`
- `H2` means `## Question` becomes the front field
- the answer is everything below that heading until the card end marker

Heading example:

```md
## What is the capital of France?

Paris

---
```

### Card End Marker

This marks the end of one card.

Enable: Open **Settings -> Parser -> Card End Marker**.

Usage:

- the marker must appear on its own line
- default is `---`
- use it to place multiple cards in one note

Example:

```md
What is the capital of France?

? #flashcard

Paris
---

What is the capital of Japan?

? #flashcard

Tokyo
---
```

### Include From Heading Level

This controls how headings are included before parsing cards.

Enable: Open **Settings -> Parser -> Include From Heading Level**.

Usage:

- only used when `Card Source` is set to `Separator`
- `Exclude all headings` removes headings from card content
- `No heading filter` leaves headings unchanged
- `H1` to `H6` lets you treat headings as section boundaries from that level
- if you are using `Card Source = Heading`, use `Heading Level` instead

### File Link Field

This adds a normal Obsidian file link from the structured parser.

Enable: Open **Settings -> Parser -> File Link Field** and choose a destination field.

Usage:

- stores a link back to the source note
- leave it blank if you do not want a file link for structured parser cards

### Context Path

This adds the text context path from the structured parser.

Enable: Open **Settings -> Parser -> Context Path Field** and choose a destination field.

Usage:

- stores path and heading context as text
- useful when multiple cards come from long topic notes
- leave it blank to skip it

### Exact Card Link Field

This adds a deep link to the exact generated card location.

Enable: Open **Settings -> Parser -> Exact Card Link Field** and choose a destination field.

Usage:

- creates a more precise link than a normal file link
- uses the generated block ID for that card, such as `anki-<id>`
- useful when you want Anki to jump directly to the exact source block

⚠️ Important:

- this requires the extra [Obsidian Advanced URI](https://community.obsidian.md/plugins/obsidian-advanced-uri) plugin
- without that plugin, use `File Link Field` instead

### Section Field Map

This routes labeled sections into specific Anki fields.

Enable: Open **Settings -> Parser -> Section Field Map** after selecting a note type with available fields.

Usage:

- write one mapping per line in the format `Label=Field`
- the label is what you write in the note
- the field is the Anki field that should receive that section

Example mapping:

```text
Explanation=Extra
Ref=Source
```

Example note:

```md
What is the treatment of choice for anaphylaxis?

? #flashcard

Intramuscular epinephrine.

**Explanation**
Give IM epinephrine early in the lateral thigh. Airway, oxygen, IV fluids, and monitoring are also important.

**Ref**
Emergency guideline summary
---
```

Result:

- the question text goes to the front field
- the main answer goes to the back field
- the `Explanation` block goes to `Extra`
- the `Ref` block goes to `Source`

## Advanced and Experimental Features

### AnkiConnect API Key

You can configure an API key to securely connect to AnkiConnect. This is useful if you have enabled authentication in your AnkiConnect add-on settings to prevent unauthorized access.

Enable: Go to **Settings -> Advanced -> Experimental Features** and enter your key in `AnkiConnect API Key`.

Usage:

- the API key is automatically included in all requests to Anki
- if you have not configured an API key in AnkiConnect, leave this field blank

### Smart Scan

Smart Scan skips unchanged files by using a stored file hash.

Enable: Go to **Settings -> Advanced -> Experimental Features -> Smart Scan**.

Usage:

- on: only changed files are scanned
- off: files are scanned again even if they did not change
- useful to speed up repeated sync runs on large vaults

### Save Note ID to Frontmatter

This stores the Anki note ID in YAML frontmatter instead of inline note text.

Enable: Go to **Settings -> Advanced -> Experimental Features -> Save Note ID to Frontmatter**.

Usage:

- useful if you prefer cleaner note bodies
- works cleanly when one file corresponds to one Anki note
- files containing multiple notes still use inline IDs where needed

### Bulk Delete IDs

This enables a menu action that deletes synced Anki items for a file and removes their stored IDs from the note.

Enable: Go to **Settings -> Advanced -> Experimental Features -> Bulk Delete IDs**.

Usage:

1. Turn on the setting.
2. Right-click a Markdown file in the file explorer.
3. Choose `Delete all IDs in file`.

Effect:

- deletes matching notes or cards in Anki
- removes the stored IDs from the Obsidian file
- keeps the rest of the Markdown content

⚠️ This is destructive. Use it carefully.

### Render Clozes in Reading View

This changes how cloze syntax appears in Obsidian Reading View.

Enable: Go to **Settings -> Advanced -> Experimental Features -> Render Clozes in Reading View**.

Usage:

- renders `{{c1::answer::hint}}` as flattened readable text
- useful if you want cleaner reading view inside Obsidian
- reload the current file or tab after changing this setting

### Highlight Rendered Clozes

This highlights the rendered cloze text in Reading View.

Enable: Turn on **Render Clozes in Reading View** first. Then enable **Highlight Rendered Clozes**.

Usage:

- applies highlight styling to rendered clozes
- useful if you want cloze content to stand out visually
- reload the current file or tab after changing this setting

### Cloze Deletion Context Menu

This adds right-click support for creating clozes from selected text.

Enable: Go to **Settings -> Advanced -> Experimental Features -> Cloze Deletion Context Menu**.

Usage:

- right-click selected editor text and use the `Anki Cloze` menu
- available commands include `Add Anki Cloze` and `Remove Anki Cloze`
- reload Obsidian after changing this setting

### Auto Re-link by Content

This helps recover when a stored Anki ID no longer exists in Anki.

Enable: Go to **Settings -> Advanced -> Orphan Recovery -> Auto Re-link by Content**.

Usage:

- when an Anki ID is missing, the plugin can search by content and reconnect the note
- useful if cards were moved, restored, or changed in Anki outside the normal sync flow

## Stability Improvements in This Fork

These are built-in improvements. They do not require a separate toggle.

- note-type field regeneration refreshes field definitions more reliably
- file links, aliases, and context use more consistent newline handling
- note-type field selections fall back more safely after regeneration
- sync workflow and feedback are clearer than the upstream baseline

## References

- [REDESIGN_NOTES.md](./REDESIGN_NOTES.md)
- [Latest releases](https://github.com/bd-tec/obsidian_to_anki_tec/releases/latest)
- [Upstream Obsidian_to_Anki wiki](https://github.com/Pseudonium/Obsidian_to_Anki/wiki)
