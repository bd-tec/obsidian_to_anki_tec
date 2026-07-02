import { FIELDS_DICT } from './field-interface'
import { AnkiConnectNote } from './note-interface'

export interface PluginSettings {
	CUSTOM_REGEXPS: Record<string, string>,
	REGEXP_TAGS: Record<string, string>,
	FILE_LINK_FIELDS: Record<string, string>,
	CONTEXT_FIELDS: Record<string, string>,
	ALIAS_FIELDS: Record<string, string>,
	FOLDER_DECKS: Record<string, string>,
	FOLDER_TAGS: Record<string, string>,
	SCAN_DIRECTORIES: string[],
	EXCLUDED_FOLDERS: string[],
	Syntax: {
		"Begin Note": string,
		"End Note": string,
		"Begin Inline Note": string,
		"End Inline Note": string,
		"Target Deck Line": string,
		"File Tags Line": string,
		"Delete Note Line": string,
		"Frozen Fields Line": string
	},
	Defaults: {
		"Scan Directory": string,
		"Scan Tags": string,
		"Default Tags": string,
		"Deck": string,
		"Scheduling Interval": number
		"Add File Link": boolean,
		"Add Context": boolean,
		"Add Aliases": boolean,
		"CurlyCloze": boolean,
		"CurlyCloze - Highlights to Clozes": boolean,
		"ID Comments": boolean,
		"Add Inline Tags": boolean,
		"Add Frontmatter Tags": boolean,
		"Convert to Anki Hierarchy": boolean,
		"CurlyCloze - Keyword": string,
		"Smart Scan": boolean,
		"Bulk Delete IDs": boolean,
		"Regex Required Tags": boolean,
		"Add File Link - Link Label": string,
		"Save Note ID to Frontmatter": boolean,
		"Render Clozes in Reading View": boolean,
		"Render Clozes - Highlight": boolean,
		"Cloze Deletion Context Menu": boolean,
		"Show Status Bar": boolean,
		"AnkiConnect API Key": string,
		"Auto Relink by Content": boolean,
		"Structured Parser": boolean,
		"Structured Parser - Note Type": string,
		"Structured Parser - Card Source": string,
		"Structured Parser - Front Back Separator": string,
		"Structured Parser - Card End Marker": string,
		"Structured Parser - Heading Level": number,
		"Structured Parser - Include From Heading Level": number,
		"Structured Parser - Front Field": string,
		"Structured Parser - Back Field": string,
		"Structured Parser - File Link Field": string,
		"Structured Parser - Context Field": string,
		"Structured Parser - Context Link Field": string,
		"Structured Parser - Section Field Map": string
	},
	IGNORED_FILE_GLOBS: string[]
}

export interface FileData {
	//All the data that a file would need.
	fields_dict: FIELDS_DICT
	custom_regexps: Record<string, string>
	regexp_tags: Record<string, string>
	file_link_fields: Record<string, string>
	context_fields: Record<string, string>
	alias_fields: Record<string, string>
	template: AnkiConnectNote
	EXISTING_IDS: number[]
	vault_name: string

	FROZEN_REGEXP: RegExp
	DECK_REGEXP: RegExp
	TAG_REGEXP: RegExp
	NOTE_REGEXP: RegExp
	INLINE_REGEXP: RegExp
	EMPTY_REGEXP: RegExp

	curly_cloze: boolean
	highlights_to_cloze: boolean
	comment: boolean
	add_context: boolean
	add_aliases: boolean
	add_obs_tags: boolean
	use_anki_hierarchy: boolean
	cloze_keyword: string
	yaml_tags: boolean
	regex_required_tags: boolean
	add_file_link: boolean
	link_label: string
	saveIDToFrontmatter: boolean
	auto_relink: boolean
	structured_parser: boolean
	structured_note_type: string
	structured_card_source: string
	structured_separator: string
	structured_card_end: string
	structured_heading_level: number
	structured_include_heading_level: number
	structured_front_field: string
	structured_back_field: string
	structured_file_link_field: string
	structured_context_field: string
	structured_context_link_field: string
	structured_section_field_map: Record<string, string>
}

export interface ParsedSettings extends FileData {
	folder_decks: Record<string, string>
	folder_tags: Record<string, string>
	ignored_file_globs: string[],
	smart_scan: boolean,
}
