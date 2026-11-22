import { type CollectionEntry, getCollection } from "astro:content";
import { collectionDateSort } from "@/utils/date";

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
