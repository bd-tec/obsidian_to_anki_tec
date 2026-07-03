/*Class for managing a list of files, and their Anki requests.*/
import { ParsedSettings, FileData } from './interfaces/settings-interface'
import { App, TFile, TFolder, TAbstractFile, CachedMetadata, FileSystemAdapter, Notice } from 'obsidian'
import { AllFile, RelinkCandidate } from './file'
import * as AnkiConnect from './anki'
import { AnkiConnectNote } from './interfaces/note-interface'
import { basename } from 'path'
import multimatch from "multimatch"
interface addNoteResponse {
    result: number,
    error: string | null
}

interface notesInfoResponse {
    result: Array<{
        noteId: number,
        modelName: string,
        tags: string[],
        fields: Record<string, {
            order: number,
            value: string
        }>,
        cards: number[]
    }>,
    error: string | null
}

interface Requests1Result {
    0: {
        error: string | null,
        result: Array<{
            result: addNoteResponse[],
            error: string | null
        }>
    },
    1: {
        error: string | null,
        result: notesInfoResponse[]
    },
    2: any,
    3: any,
    4: any

}

function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    let _difference = new Set(setA)
    for (let elem of setB) {
        _difference.delete(elem)
    }
    return _difference
}

function normalizeFieldText(text: string): string {
    if (text == null) return ''
    let value = text.replace(/<[^>]*>/g, '')
    value = value
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
    return value.replace(/\s+/g, ' ').trim()
}

function escapeForAnkiSearch(text: string): string {
    return normalizeFieldText(text).slice(0, 200).replace(/"/g, '""')
}

function getSearchTokens(text: string): string[] {
    const normalized = normalizeFieldText(text).toLowerCase()
    const tokens = normalized.match(/[a-z0-9\u00c0-\u024f]+/gi) ?? []
    return tokens.filter(token => token.length >= 3).slice(0, 6)
}

interface MatchingCandidate {
    noteId: number
    fields: Record<string, string>
}

async function findMatchingCandidates(firstFieldValue: string, firstFieldName: string): Promise<MatchingCandidate[]> {
    if (!firstFieldValue) return []
    const escapedValue = escapeForAnkiSearch(firstFieldValue)
    const tokens = getSearchTokens(firstFieldValue)
    const wildcardQuery = tokens.map(token => `*${token}*`).join(" ")
    const fieldWildcardQuery = firstFieldName
        ? tokens.map(token => `${firstFieldName}:*${token}*`).join(" ")
        : ""
    const queries = firstFieldName
        ? [
            `${firstFieldName}:"${escapedValue}"`,
            `"${escapedValue}"`,
            fieldWildcardQuery,
            wildcardQuery
        ].filter(query => query.length > 0)
        : [
            `"${escapedValue}"`,
            wildcardQuery
        ].filter(query => query.length > 0)

    let noteIds: number[] = []
    try {
        for (let query of queries) {
            const result = await AnkiConnect.invoke('findNotes', { query }) as number[]
            if (result && result.length > 0) {
                noteIds = result
                break
            }
        }
    } catch (error) {
        console.warn('findMatchingCandidates: findNotes failed:', error)
        return []
    }
    if (!noteIds.length) return []

    let infos: any[]
    try {
        infos = await AnkiConnect.invoke('notesInfo', { notes: noteIds }) as any[]
    } catch (error) {
        console.warn('findMatchingCandidates: notesInfo failed:', error)
        return []
    }

    const candidates: MatchingCandidate[] = []
    for (let info of infos) {
        if (!info || !info.fields) continue
        const fields: Record<string, string> = {}
        for (let fieldName of Object.keys(info.fields)) {
            fields[fieldName] = info.fields[fieldName].value ?? ''
        }
        candidates.push({ noteId: info.noteId, fields })
    }
    return candidates
}


export class FileManager {
    app: App
    data: ParsedSettings
    files: TFile[]
    ownFiles: Array<AllFile>
    file_hashes: Record<string, string>
    requests_1_result: any
    added_media_set: Set<string>
    relinked: number = 0
    relinkFailed: number = 0
    ambiguousDuplicates: number = 0
    duplicateTagged: number = 0

    constructor(app: App, data: ParsedSettings, files: TFile[], file_hashes: Record<string, string>, added_media: string[]) {
        this.app = app
        this.data = data

        this.files = this.findFilesThatAreNotIgnored(files, data);

        this.ownFiles = []
        this.file_hashes = file_hashes
        this.added_media_set = new Set(added_media)
    }
    getUrl(file: TFile): string {
        return "obsidian://open?vault=" + encodeURIComponent(this.data.vault_name) + String.raw`&file=` + encodeURIComponent(file.path)
    }

    findFilesThatAreNotIgnored(files: TFile[], data: ParsedSettings): TFile[] {
        let ignoredFiles = []
        ignoredFiles = multimatch(files.map(file => file.path), data.ignored_file_globs)

        let notIgnoredFiles = files.filter(file => !ignoredFiles.contains(file.path))
        return notIgnoredFiles;
    }

    getFolderPathList(file: TFile): TFolder[] {
        let result: TFolder[] = []
        let abstractFile: TAbstractFile = file
        while (abstractFile && abstractFile.hasOwnProperty('parent')) {
            result.push(abstractFile.parent)
            abstractFile = abstractFile.parent
        }
        result.pop() // Removes top-level vault
        return result
    }

    getDefaultDeck(file: TFile, folder_path_list: TFolder[]): string {
        let folder_decks = this.data.folder_decks
        for (let folder of folder_path_list) {
            // Loops over them from innermost folder
            if (folder_decks[folder.path]) {
                return folder_decks[folder.path]
            }
        }
        // If no decks specified
        return this.data.template.deckName
    }

    getDefaultTags(file: TFile, folder_path_list: TFolder[]): string[] {
        let folder_tags = this.data.folder_tags
        let tags_list: string[] = []
        for (let folder of folder_path_list) {
            // Loops over them from innermost folder
            if (folder_tags[folder.path]) {
                tags_list.push(...folder_tags[folder.path].split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0))
            }
        }
        tags_list.push(...this.data.template.tags)
        return tags_list
    }

    dataToFileData(file: TFile): FileData {
        const folder_path_list: TFolder[] = this.getFolderPathList(file)
        let result: FileData = JSON.parse(JSON.stringify(this.data))
        //Lost regexp, so have to get them back
        result.FROZEN_REGEXP = this.data.FROZEN_REGEXP
        result.DECK_REGEXP = this.data.DECK_REGEXP
        result.TAG_REGEXP = this.data.TAG_REGEXP
        result.NOTE_REGEXP = this.data.NOTE_REGEXP
        result.INLINE_REGEXP = this.data.INLINE_REGEXP
        result.EMPTY_REGEXP = this.data.EMPTY_REGEXP
        result.template.deckName = this.getDefaultDeck(file, folder_path_list)
        result.template.tags = this.getDefaultTags(file, folder_path_list)
        return result
    }

    async genAllFiles() {
        for (let file of this.files) {
            const content: string = await this.app.vault.read(file)
            const cache: CachedMetadata = this.app.metadataCache.getCache(file.path)
            const file_data = this.dataToFileData(file)
            this.ownFiles.push(
                new AllFile(
                    content,
                    file.path,
                    (this.data.add_file_link) ? this.getUrl(file) : "",
                    file_data,
                    cache
                )
            )
        }
    }

    async initialiseFiles() {
        await this.genAllFiles()
        let files_changed: Array<AllFile> = []
        let obfiles_changed: TFile[] = []
        for (let index in this.ownFiles) {
            const i = parseInt(index)
            let file = this.ownFiles[i]
            if (!this.data.smart_scan || !(this.file_hashes.hasOwnProperty(file.path) && file.getHash() === this.file_hashes[file.path])) {
                //Indicates it's changed or new
                console.info("Scanning ", file.path, "as it's changed or new.")
                file.scanFile()
                files_changed.push(file)
                obfiles_changed.push(this.files[i])
            }
        }
        this.ownFiles = files_changed
        this.files = obfiles_changed
    }

    async requests_1() {
        if (this.data.auto_relink) {
            await this.relinkOrphans()
            await this.adoptMissingIds()
        }

        let requests: AnkiConnect.AnkiConnectRequest[] = []
        let temp: AnkiConnect.AnkiConnectRequest[] = []
        console.info("Requesting addition of new deck into Anki...")
        for (let file of this.ownFiles) {
            temp.push(file.getCreateDecks())
        }
        requests.push(AnkiConnect.multi(temp))
        temp = []
        console.info("Requesting addition of notes into Anki...")
        for (let file of this.ownFiles) {
            temp.push(file.getAddNotes())
        }
        requests.push(AnkiConnect.multi(temp))
        temp = []
        console.info("Requesting card IDs of notes to be edited...")
        for (let file of this.ownFiles) {
            temp.push(file.getNoteInfo())
        }
        requests.push(AnkiConnect.multi(temp))
        temp = []
        console.info("Requesting tag list...")
        requests.push(AnkiConnect.getTags())
        console.info("Requesting update of fields of existing notes")
        for (let file of this.ownFiles) {
            temp.push(file.getUpdateFields())
        }
        requests.push(AnkiConnect.multi(temp))
        temp = []
        console.info("Requesting deletion of notes..")
        for (let file of this.ownFiles) {
            temp.push(file.getDeleteNotes())
        }
        requests.push(AnkiConnect.multi(temp))
        temp = []
        console.info("Requesting addition of media...")
        for (let file of this.ownFiles) {
            const mediaLinks = difference(file.formatter.detectedMedia, this.added_media_set)
            for (let mediaLink of mediaLinks) {
                const dataFile = this.app.metadataCache.getFirstLinkpathDest(mediaLink, file.path)
                if (!(dataFile)) {
                    console.warn("Couldn't locate media file ", mediaLink)
                }
                else {
                    // Located successfully, so treat as if we've added the media
                    this.added_media_set.add(mediaLink)
                    const realPath = (this.app.vault.adapter as FileSystemAdapter).getFullPath(dataFile.path)
                    temp.push(
                        AnkiConnect.storeMediaFileByPath(
                            basename(mediaLink),
                            realPath
                        )
                    )
                }
            }
        }
        requests.push(AnkiConnect.multi(temp))
        temp = []
        this.requests_1_result = ((await AnkiConnect.invoke('multi', { actions: requests }) as Array<Object>).slice(1) as any)
        await this.parse_requests_1()
    }

    async parse_requests_1() {
        const response = this.requests_1_result as Requests1Result
        if (response[5].result.length >= 1 && response[5].result[0].error != null) {
            new Notice("Please update AnkiConnect! The way the script has added media files has changed.")
            console.warn("Please update AnkiConnect! The way the script has added media files has changed.")
        }
        let note_ids_array_by_file: Requests1Result[0]["result"]
        try {
            note_ids_array_by_file = AnkiConnect.parse(response[0])
        } catch (error) {
            console.error("Error: ", error)
            note_ids_array_by_file = response[0].result
        }
        const note_info_array_by_file = AnkiConnect.parse(response[1])
        const tag_list: string[] = AnkiConnect.parse(response[2])
        for (let index in note_ids_array_by_file) {
            let i: number = parseInt(index)
            let file = this.ownFiles[i]
            let file_response: addNoteResponse[]
            try {
                file_response = AnkiConnect.parse(note_ids_array_by_file[i])
            } catch (error) {
                console.error("Error: ", error)
                file_response = note_ids_array_by_file[i].result
            }
            file.note_ids = []
            for (let index in file_response) {
                let i = parseInt(index)
                let response = file_response[i]
                try {
                    file.note_ids.push(AnkiConnect.parse(response))
                } catch (error) {
                    console.warn("Failed to add note ", file.all_notes_to_add[i], " in file", file.path, " due to error ", error)
                    file.note_ids.push(response.result)
                }
            }
        }
        for (let index in note_info_array_by_file) {
            let i: number = parseInt(index)
            let file = this.ownFiles[i]
            const file_response = AnkiConnect.parse(note_info_array_by_file[i])
            let temp: number[] = []
            for (let note_response of file_response) {
                temp.push(...note_response.cards)
            }
            file.card_ids = temp
            for (let j = 0; j < file_response.length; j++) {
                if (file.notes_to_edit[j] && file.notes_to_edit[j].identifier === file_response[j].noteId) {
                    file.notes_to_edit[j].current_tags = file_response[j].tags
                }
            }
        }
        for (let index in this.ownFiles) {
            let i: number = parseInt(index)
            let ownFile = this.ownFiles[i]
            let obFile = this.files[i]
            ownFile.tags = tag_list
            ownFile.writeIDs()
            ownFile.removeEmpties()
            if (ownFile.file !== ownFile.original_file) {
                await this.app.vault.modify(obFile, ownFile.file)
            }
        }
        await this.requests_2()
    }

    async relinkOrphans() {
        for (let file of this.ownFiles) {
            const orphans = file.notes_to_relink.slice()
            for (let orphan of orphans) {
                const matchedId = await this.findExactMatchingNoteId(file, orphan.note)
                if (matchedId !== null) {
                    this.removeFromAddList(file, orphan)
                    file.notes_to_edit.push({ note: orphan.note, identifier: matchedId })
                    if (orphan.kind !== "structured") {
                        file.notesToWriteInline.push({
                            position: orphan.writePosition,
                            id: matchedId,
                            inline: orphan.inline
                        })
                    } else {
                        file.structuredMetadataWrites.push({
                            position: orphan.writePosition,
                            id: matchedId
                        })
                    }
                    file.notes_to_relink.splice(file.notes_to_relink.indexOf(orphan), 1)
                    this.relinked++
                } else {
                    this.relinkFailed++
                }
            }
            this.refreshAllNotesToAdd(file)
        }
        if (this.relinked > 0) {
            new Notice(`Re-linked ${this.relinked} orphaned note${this.relinked === 1 ? '' : 's'} to existing Anki cards.`)
        }
    }

    async adoptMissingIds() {
        for (let file of this.ownFiles) {
            const orphanNotes = new Set(file.notes_to_relink.map(orphan => orphan.note))
            const candidates = this.collectAdditionCandidates(file)
            for (let candidate of candidates) {
                if (orphanNotes.has(candidate.note)) continue
                const matchedId = await this.findExactMatchingNoteId(file, candidate.note)
                if (matchedId === null) continue
                this.removeFromAddList(file, candidate)
                file.notes_to_edit.push({ note: candidate.note, identifier: matchedId })
                if (candidate.kind !== "structured") {
                    file.notesToWriteInline.push({
                        position: candidate.writePosition,
                        id: matchedId,
                        inline: candidate.inline
                    })
                } else {
                    file.structuredMetadataWrites.push({
                        position: candidate.writePosition,
                        id: matchedId
                    })
                }
                this.relinked++
            }
            this.refreshAllNotesToAdd(file)
        }
    }

    async findExactMatchingNoteIds(file: AllFile, note: AnkiConnectNote): Promise<number[]> {
        const fieldNames = file.data.fields_dict[note.modelName]
        if (!fieldNames || fieldNames.length === 0) return []

        const ignoredFields = new Set<string>()
        if (file.data.structured_note_type === note.modelName && file.data.structured_context_link_field) {
            ignoredFields.add(file.data.structured_context_link_field)
        }
        if (file.data.structured_note_type === note.modelName && file.data.structured_file_link_field) {
            ignoredFields.add(file.data.structured_file_link_field)
        }
        if (file.data.structured_note_type === note.modelName && file.data.structured_context_field) {
            ignoredFields.add(file.data.structured_context_field)
        }

        const compareFieldNames = fieldNames.filter(fieldName => !ignoredFields.has(fieldName))
        const obsValuesByField = new Map<string, string>()
        for (let fieldName of compareFieldNames) {
            obsValuesByField.set(fieldName, normalizeFieldText(note.fields[fieldName] ?? ''))
        }
        const frontField = compareFieldNames[0]
        const backField = compareFieldNames[1]
        const frontText = obsValuesByField.get(frontField) ?? ''
        if (!frontText) return []

        const candidates = await findMatchingCandidates(frontText, frontField)
        const exactMatches: number[] = []
        for (let candidate of candidates) {
            let allMatch = true
            for (let fieldName of compareFieldNames) {
                const obsValue = obsValuesByField.get(fieldName) ?? ''
                const mustMatch = fieldName === frontField || fieldName === backField || obsValue.length > 0
                if (!mustMatch) continue
                const candidateValue = normalizeFieldText(candidate.fields[fieldName] ?? '')
                if (candidateValue !== obsValue) {
                    allMatch = false
                    break
                }
            }
            if (allMatch) {
                exactMatches.push(candidate.noteId)
            }
        }
        return exactMatches
    }

    async findExactMatchingNoteId(file: AllFile, note: AnkiConnectNote): Promise<number | null> {
        const exactMatches = await this.findExactMatchingNoteIds(file, note)
        if (exactMatches.length === 1) {
            return exactMatches[0]
        }
        if (exactMatches.length > 1) {
            this.ambiguousDuplicates++
            await this.tagDuplicateCandidates(file, note, exactMatches)
        }
        return null
    }

    async tagDuplicateCandidates(file: AllFile, note: AnkiConnectNote, exactMatches?: number[]): Promise<number> {
        const matches = exactMatches ?? await this.findExactMatchingNoteIds(file, note)
        if (matches.length === 0) return 0
        const tag = matches.length > 1 ? "obsidian_relink_ambiguous" : "obsidian_duplicate_candidate"
        try {
            await AnkiConnect.invoke('addTags', { notes: matches, tags: tag })
            this.duplicateTagged += matches.length
            console.warn(`Tagged ${matches.length} Anki note(s) with "${tag}" for duplicate review in ${file.path}`)
            return matches.length
        } catch (error) {
            console.warn(`Failed to tag duplicate candidates in ${file.path}: ${error}`)
            return 0
        }
    }

    collectAdditionCandidates(file: AllFile): RelinkCandidate[] {
        const result: RelinkCandidate[] = []
        file.notes_to_add.forEach((note, index) => {
            result.push({ note, kind: "block", index, writePosition: file.id_indexes[index], inline: false })
        })
        file.inline_notes_to_add.forEach((note, index) => {
            result.push({ note, kind: "inline", index, writePosition: file.inline_id_indexes[index], inline: true })
        })
        file.regex_notes_to_add.forEach((note, index) => {
            result.push({ note, kind: "regex", index, writePosition: file.regex_id_indexes[index], inline: false })
        })
        file.structured_notes_to_add.forEach((note, index) => {
            result.push({ note, kind: "structured", index, writePosition: file.structured_id_indexes[index], inline: false })
        })
        return result
    }

    removeFromAddList(file: AllFile, candidate: RelinkCandidate) {
        const removeAt = (notes: AnkiConnectNote[], indexes: number[]) => {
            const idx = notes.indexOf(candidate.note)
            const targetIndex = idx >= 0 ? idx : candidate.index
            notes.splice(targetIndex, 1)
            indexes.splice(targetIndex, 1)
        }
        if (candidate.kind === "block") {
            removeAt(file.notes_to_add, file.id_indexes)
        } else if (candidate.kind === "inline") {
            removeAt(file.inline_notes_to_add, file.inline_id_indexes)
        } else if (candidate.kind === "regex") {
            removeAt(file.regex_notes_to_add, file.regex_id_indexes)
        } else if (candidate.kind === "structured") {
            removeAt(file.structured_notes_to_add, file.structured_id_indexes)
        }
    }

    refreshAllNotesToAdd(file: AllFile) {
        file.all_notes_to_add = file.notes_to_add
            .concat(file.inline_notes_to_add)
            .concat(file.regex_notes_to_add)
            .concat(file.structured_notes_to_add)
    }

    getHashes(): Record<string, string> {
        let result: Record<string, string> = {}
        for (let file of this.ownFiles) {
            result[file.path] = file.getHash()
        }
        return result
    }

    async requests_2(): Promise<void> {
        let requests: AnkiConnect.AnkiConnectRequest[] = []
        let temp: AnkiConnect.AnkiConnectRequest[] = []
        console.info("Requesting cards to be moved to target deck...")
        for (let file of this.ownFiles) {
            temp.push(file.getChangeDecks())
        }
        requests.push(AnkiConnect.multi(temp))
        temp = []
        console.info("Requesting tags to be replaced...")
        for (let file of this.ownFiles) {
            let rem = file.getClearTags()
            if (rem.params.actions && rem.params.actions.length) {
                temp.push(rem)
            }
        }
        requests.push(AnkiConnect.multi(temp))
        temp = []
        for (let file of this.ownFiles) {
            temp.push(file.getAddTags())
        }
        requests.push(AnkiConnect.multi(temp))
        temp = []
        console.info("Requesting structured context link updates...")
        for (let file of this.ownFiles) {
            temp.push(...file.getStructuredContextLinkUpdates())
        }
        requests.push(AnkiConnect.multi(temp))
        temp = []
        await AnkiConnect.invoke('multi', { actions: requests })
        console.info("All done!")
    }



}
