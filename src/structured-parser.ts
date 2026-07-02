import { FormatConverter } from './format'
import { FROZEN_FIELDS_DICT } from './interfaces/field-interface'
import { AnkiConnectNote, AnkiConnectNoteAndID } from './interfaces/note-interface'
import { FileData } from './interfaces/settings-interface'
import { ID_REGEXP_STR, TAG_SEP } from './note'

const OBS_TAG_REGEXP: RegExp = /#([a-zA-Z0-9_\u00C0-\uFFFF\/\-]+)/g

export interface StructuredCard {
	front: string
	answer: string
	extra: string
	routedSections: Record<string, string>
	identifier: number | null
	startOffset: number
	idWriteOffset: number
	idSpans: [number, number][]
	hasAnchor: boolean
}

interface TextBlock {
	text: string
	startOffset: number
}

function findTrailingMetadataStart(back: string): number {
	const metadataRegex = /(?:\n[ \t]*(?:\^anki-\d+|(?:<!--)?ID: \d+(?:-->)?)[ \t]*)+\s*$/
	const match = back.match(metadataRegex)
	if (!match || match.index === undefined) {
		return back.replace(/\s+$/, '').length
	}
	return match.index
}

function escapeRegex(source: string): string {
	return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function separatorToRegex(separator: string): RegExp {
	const pieces = separator.trim().split(/\s+/).map(escapeRegex)
	return new RegExp(pieces.join(String.raw`[\s\u00A0]+`))
}

function stripIDLines(text: string): string {
	return text
		.replace(/^[ \t]*\^anki-\d+[ \t]*$/gm, '')
		.replace(/^[ \t]*(<!--)?ID: \d+.*(-->)?[ \t]*$/gm, '')
		.replace(/\n{3,}/g, '\n\n')
}

function splitAnswerAndExtra(back: string): { answer: string, extra: string } {
	const cleaned = stripIDLines(back).replace(/^\s+/, '')
	const firstLineEnd = cleaned.indexOf('\n')
	if (firstLineEnd === -1) {
		return { answer: cleaned, extra: '' }
	}
	const searchStart = firstLineEnd + 1
	const headingMatch = cleaned.slice(searchStart).match(/(^|\n)(?=\*\*[A-Z])/)
	if (!headingMatch || headingMatch.index === undefined) {
		return { answer: cleaned, extra: '' }
	}
	const splitIndex = searchStart + headingMatch.index + headingMatch[1].length
	return {
		answer: cleaned.slice(0, splitIndex),
		extra: cleaned.slice(splitIndex)
	}
}

function stripFormattingForLabel(text: string): string {
	return text
		.replace(/^ {0,3}#{1,6}\s+/, '')
		.replace(/^\*\*/, '')
		.replace(/\*\*:?$/, '')
		.replace(/:$/, '')
		.trim()
		.toLowerCase()
}

function normalizeConfiguredSectionLabel(text: string): string {
	return text
		.replace(/^ {0,3}#{1,6}\s+/, '')
		.replace(/^[*_]+/, '')
		.replace(/[*_]+$/, '')
		.replace(/:$/, '')
		.trim()
		.toLowerCase()
}

function matchSectionLabel(line: string, sectionLabels: string[]): string | null {
	const exactNormalized = stripFormattingForLabel(line)
	const normalizedLabels = sectionLabels.map(label => ({
		raw: label,
		normalized: normalizeConfiguredSectionLabel(label)
	}))
	const exactMatch = normalizedLabels.find(label => exactNormalized === label.normalized)
	if (exactMatch) {
		return exactMatch.raw
	}
	for (let label of normalizedLabels) {
		if (!label.normalized) continue
		const inlinePattern = new RegExp(`^\\s*(?:#{1,6}\\s+)?(?:\\*\\*|__|\\*|_)?\\s*${escapeRegex(label.normalized)}\\s*(?:\\*\\*|__|\\*|_)?\\s*:?\\s+.+$`, 'i')
		if (inlinePattern.test(line.trim())) {
			return label.raw
		}
	}
	return null
}

function findRoutedSections(back: string, sectionFieldMap: Record<string, string>): { answer: string, sections: Record<string, string> } {
	const cleaned = stripIDLines(back).replace(/^\s+/, '')
	const sectionLabels = Object.keys(sectionFieldMap)
	if (sectionLabels.length === 0) {
		return { answer: cleaned, sections: {} }
	}
	const lines = cleaned.split('\n')
	const sections: Record<string, string> = {}
	let currentLabel: string | null = null
	let answerLines: string[] = []
	for (let line of lines) {
		const matchedLabel = matchSectionLabel(line, sectionLabels)
		if (matchedLabel) {
			currentLabel = matchedLabel
			if (!sections[currentLabel]) {
				sections[currentLabel] = line
			} else {
				sections[currentLabel] += "\n" + line
			}
			continue
		}
		if (currentLabel) {
			sections[currentLabel] += "\n" + line
		} else {
			answerLines.push(line)
		}
	}
	return {
		answer: answerLines.join('\n').trim(),
		sections
	}
}

function splitOnHigherLevelHeadings(blocks: TextBlock[], includeFromHeadingLevel: number): TextBlock[] {
	if (!includeFromHeadingLevel && includeFromHeadingLevel !== -1) {
		return blocks
	}
	const out: TextBlock[] = []
	const headingRegex = /^ {0,3}(#{1,6})\s+.*$/gm
	for (let block of blocks) {
		let cursor = 0
		let match: RegExpExecArray | null
		headingRegex.lastIndex = 0
		while ((match = headingRegex.exec(block.text)) !== null) {
			if (includeFromHeadingLevel !== -1 && match[1].length >= includeFromHeadingLevel) {
				continue
			}
			if (match.index > cursor) {
				out.push({
					text: block.text.slice(cursor, match.index),
					startOffset: block.startOffset + cursor
				})
			}
			cursor = match.index + match[0].length
			while (cursor < block.text.length && /[\r\n]/.test(block.text[cursor])) {
				cursor++
			}
		}
		if (cursor < block.text.length) {
			out.push({
				text: block.text.slice(cursor),
				startOffset: block.startOffset + cursor
			})
		}
	}
	return out
}

export function parseStructuredCards(
	text: string,
	separator: string,
	cardEndMarker: string,
	includeFromHeadingLevel: number = 0,
	sectionFieldMap: Record<string, string> = {}
): StructuredCard[] {
	if (!separator) return []
	const sepRegex = separatorToRegex(separator)
	const endMarkerEscaped = cardEndMarker ? escapeRegex(cardEndMarker) : null
	const endLineRegex = endMarkerEscaped ? new RegExp(`^[ \\t]*${endMarkerEscaped}[ \\t]*$`, 'm') : null
	const blocks: TextBlock[] = []
	if (endLineRegex) {
		const globalEnd = new RegExp(endLineRegex.source, 'gm')
		let lastEnd = 0
		let m: RegExpExecArray | null
		while ((m = globalEnd.exec(text)) !== null) {
			blocks.push({ text: text.slice(lastEnd, m.index), startOffset: lastEnd })
			lastEnd = m.index + m[0].length
			if (m.index === globalEnd.lastIndex) globalEnd.lastIndex++
		}
		if (lastEnd < text.length) {
			blocks.push({ text: text.slice(lastEnd), startOffset: lastEnd })
		}
	} else {
		blocks.push({ text, startOffset: 0 })
	}

	const cards: StructuredCard[] = []
	for (let block of splitOnHigherLevelHeadings(blocks, includeFromHeadingLevel)) {
		const blockText = block.text
		const sepMatch = blockText.match(sepRegex)
		if (!sepMatch || sepMatch.index === undefined) continue

		const sepIndex = sepMatch.index
		const front = blockText.slice(0, sepIndex)
		const back = blockText.slice(sepIndex + sepMatch[0].length)
		const routed = findRoutedSections(back, sectionFieldMap)
		const fallback = splitAnswerAndExtra(back)
		const answer = Object.keys(sectionFieldMap).length > 0 ? routed.answer : fallback.answer
		const extra = Object.keys(sectionFieldMap).length > 0 ? "" : fallback.extra

		const idRegex = new RegExp(ID_REGEXP_STR, 'g')
		const anchorRegex = /\^anki-\d+/g
		let idMatch: RegExpExecArray | null
		let identifier: number | null = null
		const idSpans: [number, number][] = []
		while ((idMatch = idRegex.exec(back)) !== null) {
			identifier = parseInt(idMatch[1])
			const absStart = block.startOffset + sepIndex + sepMatch[0].length + idMatch.index
			idSpans.push([absStart, absStart + idMatch[0].length])
		}
		const hasAnchor = anchorRegex.test(back)

		const idWriteOffset = block.startOffset + sepIndex + sepMatch[0].length + findTrailingMetadataStart(back)
		cards.push({
			front,
			answer,
			extra,
			routedSections: routed.sections,
			identifier,
			startOffset: block.startOffset,
			idWriteOffset,
			idSpans,
			hasAnchor
		})
	}
	return cards
}

export function structuredCardToNote(
	card: StructuredCard,
	noteType: string,
	deck: string,
	url: string,
	frozen_fields_dict: FROZEN_FIELDS_DICT,
	data: FileData,
	formatter: FormatConverter,
	context: string,
	aliases: string[],
	filename: string,
	globalTagsStr: string
): AnkiConnectNoteAndID {
	const fieldNames = data.fields_dict[noteType] || []
	const sectionFieldMap = data.structured_section_field_map || {}
	const template: AnkiConnectNote = JSON.parse(JSON.stringify(data.template))
	template.modelName = noteType
	template.deckName = deck

	const fields: Record<string, string> = {}
	for (let fn of fieldNames) fields[fn] = ''
	const frontField = data.structured_front_field || fieldNames[0] || ""
	const backField = data.structured_back_field || fieldNames[1] || fieldNames[0] || ""
	if (frontField) {
		fields[frontField] = formatter.format(card.front.trim(), noteType.includes(data.cloze_keyword) && data.curly_cloze, data.highlights_to_cloze).trim()
	}
	if (backField) {
		const backText = Object.keys(sectionFieldMap).length > 0
			? card.answer
			: (card.answer + (card.extra ? "\n\n" + card.extra : ""))
		fields[backField] = formatter.format(backText.trim(), noteType.includes(data.cloze_keyword) && data.curly_cloze, data.highlights_to_cloze).trim()
	}
	for (let label of Object.keys(sectionFieldMap)) {
		const targetField = sectionFieldMap[label]
		const sectionValue = card.routedSections[label]
		if (!targetField || !sectionValue || !(targetField in fields)) continue
		fields[targetField] = formatter.format(sectionValue.trim(), noteType.includes(data.cloze_keyword) && data.curly_cloze, data.highlights_to_cloze).trim()
	}

	if (data.add_obs_tags) {
		const tags: string[] = []
		for (let key in fields) {
			for (let m of fields[key].matchAll(OBS_TAG_REGEXP)) {
				let tag = m[1].trim()
				if (data.use_anki_hierarchy) tag = tag.replace(/\//g, '::')
				tags.push(tag)
			}
			fields[key] = fields[key].replace(OBS_TAG_REGEXP, '')
		}
		template.tags.push(...tags)
	}

	template.fields = fields
	if (url) {
		const linkField = data.structured_file_link_field || ""
		if (linkField) {
			formatter.format_note_with_url(template, url, linkField, data.link_label, filename)
		}
	}
	if (Object.keys(frozen_fields_dict).length) {
		formatter.format_note_with_frozen_fields(template, frozen_fields_dict)
	}
	if (context) {
		const contextField = data.structured_context_field || ""
		if (contextField) {
			template.fields[contextField] = (template.fields[contextField] ? template.fields[contextField] + "<br>" : "") + context
		}
	}
	if (data.add_aliases && aliases.length > 0) {
		const aliasField = data.alias_fields[noteType]
		if (aliasField) {
			template.fields[aliasField] = (template.fields[aliasField] ? template.fields[aliasField] + "<br>" : "") + aliases.join("<br>")
		}
	}
	template.tags.push(...globalTagsStr.split(TAG_SEP).filter(tag => tag.length > 0))
	return { note: template, identifier: card.identifier }
}
