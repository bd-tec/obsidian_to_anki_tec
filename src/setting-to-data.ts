import { PluginSettings, ParsedSettings } from './interfaces/settings-interface'
import { App } from 'obsidian'
import * as AnkiConnect from './anki'
import { ID_REGEXP_STR } from './note'
import { escapeRegex } from './constants'

function folderPathToIgnoreGlob(path: string): string {
    return `${path.replace(/\/+$/, '')}/**`
}

function parseSectionFieldMap(raw: string): Record<string, string> {
    const result: Record<string, string> = {}
    if (!raw) return result
    for (let line of raw.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed) continue
        const separatorIndex = trimmed.includes('=>') ? trimmed.indexOf('=>') : trimmed.indexOf('=')
        if (separatorIndex === -1) continue
        const label = trimmed.slice(0, separatorIndex).trim()
        const field = trimmed.slice(separatorIndex + (trimmed.includes('=>') ? 2 : 1)).trim()
        if (!label || !field) continue
        result[label] = field
    }
    return result
}

function filterSectionFieldMap(
    mapping: Record<string, string>,
    availableFields: string[],
    frontField: string,
    backField: string,
    fileLinkField: string,
    contextField: string,
    contextLinkField: string
): Record<string, string> {
    const reserved = new Set([frontField, backField, fileLinkField, contextField, contextLinkField].filter(Boolean))
    const allowed = new Set(availableFields.filter(field => !reserved.has(field)))
    const filtered: Record<string, string> = {}
    for (let [label, field] of Object.entries(mapping)) {
        if (allowed.has(field)) {
            filtered[label] = field
        }
    }
    return filtered
}

export async function settingToData(app: App, settings: PluginSettings, fields_dict: Record<string, string[]>): Promise<ParsedSettings> {
    let result: ParsedSettings = <ParsedSettings>{}

    //Some processing required
    result.vault_name = app.vault.getName()
    result.fields_dict = fields_dict
    result.custom_regexps = settings.CUSTOM_REGEXPS
    result.regexp_tags = settings.REGEXP_TAGS
    result.file_link_fields = settings.FILE_LINK_FIELDS
    result.context_fields = settings.CONTEXT_FIELDS
    result.alias_fields = settings.ALIAS_FIELDS
    result.folder_decks = settings.FOLDER_DECKS
    result.folder_tags = settings.FOLDER_TAGS
    result.template = {
        deckName: settings.Defaults.Deck,
        modelName: "",
        fields: {},
        options: {
            allowDuplicate: false,
            duplicateScope: "deck"
        },
        tags: settings.Defaults["Default Tags"].split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0)
    }
    result.EXISTING_IDS = await AnkiConnect.invoke('findNotes', { query: "" }) as number[]

    //RegExp section
    result.FROZEN_REGEXP = new RegExp(escapeRegex(settings.Syntax["Frozen Fields Line"]) + String.raw` - (.*?):\n((?:[^\n][\n]?)+)`, "g")
    result.DECK_REGEXP = new RegExp(String.raw`^` + escapeRegex(settings.Syntax["Target Deck Line"]) + String.raw`(?:\n|: )(.*)`, "m")
    result.TAG_REGEXP = new RegExp(String.raw`^` + escapeRegex(settings.Syntax["File Tags Line"]) + String.raw`(?:\n|: )(.*)`, "m")
    result.NOTE_REGEXP = new RegExp(String.raw`^` + escapeRegex(settings.Syntax["Begin Note"]) + String.raw`\n([\s\S]*?\n)` + escapeRegex(settings.Syntax["End Note"]), "gm")
    result.INLINE_REGEXP = new RegExp(escapeRegex(settings.Syntax["Begin Inline Note"]) + String.raw`(.*?)` + escapeRegex(settings.Syntax["End Inline Note"]), "g")
    result.EMPTY_REGEXP = new RegExp(escapeRegex(settings.Syntax["Delete Note Line"]) + ID_REGEXP_STR, "g")

    //Just a simple transfer
    result.curly_cloze = settings.Defaults.CurlyCloze
    result.highlights_to_cloze = settings.Defaults["CurlyCloze - Highlights to Clozes"]
    result.curly_cloze = settings.Defaults.CurlyCloze
    result.highlights_to_cloze = settings.Defaults["CurlyCloze - Highlights to Clozes"]
    result.add_file_link = settings.Defaults["Add File Link"];
    result.comment = settings.Defaults["ID Comments"]
    result.add_context = settings.Defaults["Add Context"];
    result.add_aliases = settings.Defaults["Add Aliases"];
    result.add_obs_tags = settings.Defaults["Add Inline Tags"]
    result.use_anki_hierarchy = settings.Defaults["Convert to Anki Hierarchy"]
    result.cloze_keyword = settings.Defaults["CurlyCloze - Keyword"]
    result.smart_scan = settings.Defaults["Smart Scan"]
    result.yaml_tags = settings.Defaults["Add Frontmatter Tags"]
    result.regex_required_tags = settings.Defaults["Regex Required Tags"]
    result.link_label = settings.Defaults["Add File Link - Link Label"];
    const excludedFolders = (settings.EXCLUDED_FOLDERS ?? [])
        .map(path => path.trim())
        .filter(path => path.length > 0)
        .map(folderPathToIgnoreGlob)
    result.ignored_file_globs = [...(settings.IGNORED_FILE_GLOBS ?? []), ...excludedFolders];
    result.saveIDToFrontmatter = settings.Defaults["Save Note ID to Frontmatter"];
    result.auto_relink = settings.Defaults["Auto Relink by Content"] ?? true;
    result.structured_parser = settings.Defaults["Structured Parser"] ?? false;
    result.structured_note_type = settings.Defaults["Structured Parser - Note Type"] ?? "";
    result.structured_separator = settings.Defaults["Structured Parser - Front Back Separator"] ?? "? #flashcard";
    result.structured_card_end = settings.Defaults["Structured Parser - Card End Marker"] ?? "---";
    result.structured_include_heading_level = settings.Defaults["Structured Parser - Include From Heading Level"] ?? 0;
    result.structured_front_field = settings.Defaults["Structured Parser - Front Field"] ?? "";
    result.structured_back_field = settings.Defaults["Structured Parser - Back Field"] ?? "";
    result.structured_file_link_field = settings.Defaults["Structured Parser - File Link Field"] ?? "";
    result.structured_context_field = settings.Defaults["Structured Parser - Context Field"] ?? "";
    result.structured_context_link_field = settings.Defaults["Structured Parser - Context Link Field"] ?? "";
    result.structured_section_field_map = filterSectionFieldMap(
        parseSectionFieldMap(settings.Defaults["Structured Parser - Section Field Map"] ?? ""),
        fields_dict[result.structured_note_type] ?? [],
        result.structured_front_field,
        result.structured_back_field,
        result.structured_file_link_field,
        result.structured_context_field,
        result.structured_context_link_field
    );
    return result
}
