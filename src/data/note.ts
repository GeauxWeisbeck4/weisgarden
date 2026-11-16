import { type CollectionEntry, getCollection } from "astro:content";
import { collectionDateSort } from "@/utils/date";
import { createWikiResolver, parseWikiLinks, stripCode } from "@/utils/wikiLinks";

export const DEFAULT_NOTE_CATEGORY = "General";

export interface NoteCategory {
	name: string;
	slug: string;
	notes: CollectionEntry<"note">[];
}

function toTitleCase(str: string) {
	return str
		.replace(/[-_]+/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase())
		.trim();
}

export function slugifyCategory(name: string) {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * A note's category comes from (in order):
 * 1. the `category` frontmatter field
 * 2. the folder the note lives in, e.g. `notes/seedlings/foo.md` -> "Seedlings"
 * 3. DEFAULT_NOTE_CATEGORY
 */
export function getNoteCategory(note: CollectionEntry<"note">): string {
	if (note.data.category) return note.data.category;
	const segments = note.id.split("/");
	if (segments.length > 1 && segments[0]) return toTitleCase(segments[0]);
	return DEFAULT_NOTE_CATEGORY;
}

export async function getAllNotes() {
	const notes = await getCollection("note");
	return notes.sort(collectionDateSort);
}

/** Groups notes by category, categories sorted alphabetically, notes newest first */
export function groupNotesByCategory(notes: CollectionEntry<"note">[]): NoteCategory[] {
	const map = new Map<string, NoteCategory>();
	for (const note of [...notes].sort(collectionDateSort)) {
		const name = getNoteCategory(note);
		const slug = slugifyCategory(name);
		if (!map.has(slug)) map.set(slug, { name, slug, notes: [] });
		map.get(slug)?.notes.push(note);
	}
	return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Every resolved `[[wiki-link]]` between notes, de-duplicated, as `source -> target` id pairs */
export function getNoteLinks(notes: CollectionEntry<"note">[]) {
	const resolve = createWikiResolver(notes.map((n) => ({ id: n.id, title: n.data.title })));
	const seen = new Set<string>();
	const links: { source: string; target: string }[] = [];
	for (const note of notes) {
		for (const link of parseWikiLinks(stripCode(note.body ?? ""))) {
			const target = resolve(link.target)?.id;
			const key = `${note.id}\u0000${target}`;
			if (!target || target === note.id || seen.has(key)) continue;
			seen.add(key);
			links.push({ source: note.id, target });
		}
	}
	return links;
}

/** Returns the notes that contain a `[[wiki-link]]` pointing at `noteId`, newest first */
export function getBacklinks(noteId: string, notes: CollectionEntry<"note">[]) {
	const sources = new Set(
		getNoteLinks(notes)
			.filter((l) => l.target === noteId)
			.map((l) => l.source),
	);
	return notes.filter((n) => sources.has(n.id)).sort(collectionDateSort);
}

/** Rough plain-text excerpt of a note's markdown body, for hover previews */
export function getNoteExcerpt(note: CollectionEntry<"note">, maxLength = 280) {
	const text = stripCode(note.body ?? "")
		.replace(/^#{1,6}\s+.*$/gm, "") // headings
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
		.replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (_, t, l) => l ?? t) // wiki links
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links
		.replace(/^:{2,}.*$/gm, "") // directives
		.replace(/<[^>]+>/g, "") // html
		.replace(/[*_~>|]+/g, "")
		.replace(/^\s*([-+]|\d+\.)\s+/gm, "")
		.replace(/\s+/g, " ")
		.trim();
	return text.length > maxLength ? `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…` : text;
}
