import { type CollectionEntry, getCollection } from "astro:content";
import { getAllNotes } from "@/data/note";
import { getAllPosts } from "@/data/post";
import { type ArchiveYear, buildDateArchive } from "@/utils/archive";

export type JournalEntry = CollectionEntry<"journal">;

export interface JournalSprint {
	sprint: number;
	/** garden graph key, e.g. `sprint:3` */
	key: string;
	url: string;
	/** entries in this sprint, newest first */
	entries: JournalEntry[];
	/** earliest and latest entry dates in the sprint */
	start: Date;
	end: Date;
}

export const journalUrl = (id: string) => `/journal/${id}/`;
export const sprintKey = (sprint: number) => `sprint:${sprint}`;
export const sprintUrl = (sprint: number) => `/journal/sprint/${sprint}/`;

/** `2026-11-01`, in local time, so it matches how dates are grouped and shown across the site */
export function dayKey(date: Date) {
	const m = (date.getMonth() + 1).toString().padStart(2, "0");
	const d = date.getDate().toString().padStart(2, "0");
	return `${date.getFullYear()}-${m}-${d}`;
}

/** every journal entry (drafts only outside production), newest first */
export async function getAllJournalEntries(): Promise<JournalEntry[]> {
	const entries = await getCollection("journal", ({ data }) => {
		return import.meta.env.PROD ? !data.draft : true;
	});
	return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** journal entries counted by year and month, newest first */
export function getJournalArchive(entries: JournalEntry[]): ArchiveYear[] {
	return buildDateArchive(entries.map((e) => e.data.date));
}

/** journal entries grouped by sprint, newest sprint first */
export function getJournalSprints(entries: JournalEntry[]): JournalSprint[] {
	const groups = Map.groupBy(entries, (e) => e.data.sprint);
	return [...groups]
		.sort(([a], [b]) => b - a)
		.map(([sprint, items]) => {
			const sorted = items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
			const dates = sorted.map((e) => e.data.date.valueOf());
			return {
				sprint,
				key: sprintKey(sprint),
				url: sprintUrl(sprint),
				entries: sorted,
				start: new Date(Math.min(...dates)),
				end: new Date(Math.max(...dates)),
			};
		});
}

export interface JournalLinks {
	notes: CollectionEntry<"note">[];
	posts: CollectionEntry<"post">[];
}

/** the notes and posts published on the same day as a journal entry, plus any listed in its
 *  `notes` / `posts` frontmatter, newest first */
export function getJournalLinks(
	entry: JournalEntry,
	allNotes: CollectionEntry<"note">[],
	allPosts: CollectionEntry<"post">[],
): JournalLinks {
	const day = dayKey(entry.data.date);
	const noteIds = new Set(entry.data.notes.map((r) => r.id));
	const postIds = new Set(entry.data.posts.map((r) => r.id));
	const byDate = <T extends { data: { publishDate: Date } }>(a: T, b: T) =>
		b.data.publishDate.valueOf() - a.data.publishDate.valueOf();
	return {
		notes: allNotes
			.filter((n) => noteIds.has(n.id) || dayKey(n.data.publishDate) === day)
			.sort(byDate),
		posts: allPosts
			.filter((p) => postIds.has(p.id) || dayKey(p.data.publishDate) === day)
			.sort(byDate),
	};
}

/** everything the journal pages need, loaded once per build */
let cache: Promise<{
	entries: JournalEntry[];
	notes: CollectionEntry<"note">[];
	posts: CollectionEntry<"post">[];
}>;
export function getJournalData() {
	cache ??= Promise.all([getAllJournalEntries(), getAllNotes(), getAllPosts()]).then(
		([entries, notes, posts]) => ({ entries, notes, posts }),
	);
	return cache;
}
