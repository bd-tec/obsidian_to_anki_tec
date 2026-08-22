import { PluginSettings, ParsedSettings, SectionRule, SectionCaptureMode } from './interfaces/settings-interface'
import { App, Notice } from 'obsidian'
import * as AnkiConnect from './anki'
import { ID_REGEXP_STR } from './note'
import { escapeRegex } from './constants'
import { basename } from 'path'

function folderPathToIgnoreGlob(path: string): string {
    return `${path.replace(/\/+$/, '')}/**`
}

function sanitizeRegexSource(source: string): string {
    if (!source) return source
    // Rewrite PCRE-style end-of-string escapes so they behave in JS regexes.
    return source.replace(/(?<!\\)\\([Zz])/g, '$')
}

export function parseSectionFieldRules(raw: string): SectionRule[] {
    const rules: SectionRule[] = []
    if (!raw) return rules
    for (let line of raw.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed) continue
        const separatorIndex = trimmed.includes('=>') ? trimmed.indexOf('=>') : trimmed.indexOf('=')
        if (separatorIndex === -1) continue
        const label = trimmed.slice(0, separatorIndex).trim()
        let rest = trimmed.slice(separatorIndex + (trimmed.includes('=>') ? 2 : 1)).trim()
        if (!rest) continue

        let field = rest
        let mode: SectionCaptureMode = "section"

        const colonIdx = rest.lastIndexOf(':')
        if (colonIdx !== -1) {
            const possibleMode = rest.slice(colonIdx + 1).trim().toLowerCase()
            if (possibleMode === "section" || possibleMode === "line" || possibleMode === "end" || possibleMode === "remainder") {
                field = rest.slice(0, colonIdx).trim()
                mode = possibleMode as SectionCaptureMode
            }
        }

        if (label === "*" || mode === "remainder") {
            mode = "remainder"
        }

        if (!field) continue
        rules.push({ label, field, mode })
    }
    return rules
}

export function filterSectionRules(
    rules: SectionRule[],
    availableFields: string[]
): SectionRule[] {
    const allowed = new Set(availableFields)
    return rules.filter(rule => allowed.has(rule.field))
}

function parseSectionFieldMap(raw: string): Record<string, string> {
    const result: Record<string, string> = {}
    const rules = parseSectionFieldRules(raw)
    for (let rule of rules) {
        result[rule.label] = rule.field
    }
    return result
}

function filterSectionFieldMap(
    mapping: Record<string, string>,
    availableFields: string[]
): Record<string, string> {
    const allowed = new Set(availableFields)
    const filtered: Record<string, string> = {}
    for (let [label, field] of Object.entries(mapping)) {
        if (allowed.has(field)) {
            filtered[label] = field
        }
    }
    return filtered
}

export async function settingToData(app: App, settings: PluginSettings, fields_dict: Record<string, string[]>): Promise<ParsedSettings> {
    let result: ParsedSettings = {} as ParsedSettings

    //Some processing required
    const adapter = app.vault.adapter as { getBasePath?: () => string }
    result.vault_name = (adapter && typeof adapter.getBasePath === 'function')
        ? basename(adapter.getBasePath())
        : app.vault.getName()
    result.fields_dict = fields_dict
    result.custom_regexps = {}
    for (let note_type of Object.keys(settings.CUSTOM_REGEXPS)) {
        result.custom_regexps[note_type] = sanitizeRegexSource(settings.CUSTOM_REGEXPS[note_type])
    }
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
    try {
        result.EXISTING_IDS = await AnkiConnect.invoke('findNotes', { query: "" }) as number[]
    } catch (error) {
        new Notice("Cannot reach AnkiConnect (port 8765). Is Anki running with the AnkiConnect add-on enabled? Sync aborted.")
        throw error
    }

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
    result.structured_card_source = settings.Defaults["Structured Parser - Card Source"] ?? "separator";
    result.structured_separator = settings.Defaults["Structured Parser - Front Back Separator"] ?? "? #flashcard";
    result.structured_card_end = settings.Defaults["Structured Parser - Card End Marker"] ?? "---";
    result.structured_heading_level = settings.Defaults["Structured Parser - Heading Level"] ?? 2;
    result.structured_include_heading_level = settings.Defaults["Structured Parser - Include From Heading Level"] ?? 0;
    result.structured_front_field = settings.Defaults["Structured Parser - Front Field"] ?? "";
    result.structured_back_field = settings.Defaults["Structured Parser - Back Field"] ?? "";
    result.structured_file_link_field = settings.Defaults["Structured Parser - File Link Field"] ?? "";
    result.structured_context_field = settings.Defaults["Structured Parser - Context Field"] ?? "";
    result.structured_context_link_field = settings.Defaults["Structured Parser - Context Link Field"] ?? "";

    const rawRules = settings.Defaults["Structured Parser - Section Field Map"] ?? ""
    const parsedRules = parseSectionFieldRules(rawRules)
    const availableNoteFields = fields_dict[result.structured_note_type] ?? []
    result.structured_section_rules = filterSectionRules(
        parsedRules,
        availableNoteFields
    )
    result.structured_section_field_map = {}
    for (let rule of result.structured_section_rules) {
        result.structured_section_field_map[rule.label] = rule.field
    }
    return result
}
