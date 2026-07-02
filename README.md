# Obsidian_to_Anki_tec

`Obsidian_to_Anki_tec` is a custom fork built on top of [Obsidian_to_Anki](https://github.com/Pseudonium/Obsidian_to_Anki) and the active fork [Obsidian_to_Anki_Kai](https://github.com/n4tt0u/Obsidian_to_Anki_Kai), focused on a cleaner settings UI, better sync workflow, and quality-of-life features for everyday Anki use from Obsidian.

## Installation

This fork is not in the official Obsidian community plugin directory.

### BRAT (recommended)

1. Install **BRAT** from Obsidian Community Plugins.
2. In BRAT settings, click **Add Beta plugin**.
3. Enter `https://github.com/bd-tec/obsidian_to_anki_tec`.
4. Enable **Obsidian_to_Anki_tec** in Obsidian.

### Manual install

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/bd-tec/obsidian_to_anki_tec/releases/latest).
2. Create `<Vault>/.obsidian/plugins/obsidian-to-anki-plugin/`.
3. Put the three files into that folder.
4. Reload Obsidian and enable the plugin.

## Required Sync Setup

⚠️ Before syncing, install [AnkiConnect](https://ankiweb.net/shared/info/2055492159) in Anki and allow Obsidian to connect to it.

In Anki, go to **Tools -> Add-ons -> AnkiConnect -> Config** and use:

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

Restart Anki after changing the config.

First-time use:

1. Start Anki and open the profile you want to sync with.
2. Keep Anki running.
3. Enable or reload the Obsidian plugin so it can generate settings.
4. Sync from Obsidian.

After setup, Anki does not need to be running just to open Obsidian, but it must be running whenever you sync.

## What This Fork Adds

- Redesigned settings UI with tabs, searchable tables, and folder pickers
- Better sync commands and UX for current file, folder, and full vault sync
- Per-note-type control for file links, context, and aliases
- Structured Parser support for readable Markdown flashcards
- Extended tag support, scan tag filtering, and improved field stability
- Advanced options such as Regex Required Tags, frontmatter note IDs, and reading-view cloze rendering

## Detailed Documentation

- [Feature and functionality notes](./FEATURES_NOTES.md)
- [Redesign notes](./REDESIGN_NOTES.md)
- [Latest releases](https://github.com/bd-tec/obsidian_to_anki_tec/releases/latest)
- [Original upstream wiki](https://github.com/Pseudonium/Obsidian_to_Anki/wiki)

## Support

Bug reports and feature requests are welcome through GitHub Issues.
