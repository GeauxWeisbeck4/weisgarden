/**
 * The "garden": notes and posts treated as one connected graph.
 *
 * Nodes are notes and (published) posts. They're connected by:
 *  - `[[wiki-links]]` written in either collection (explicit links)
 *  - the section they live in (note category, or the post's top-level folder)
 *  - shared tags
 */
import type { CollectionEntry } from "astro:content";
import { getAllNotes, getNoteCategory, slugifyCategory } from "@/data/note";
import { getAllPosts } from "@/data/post";
import {
	createWikiResolver,
	type GardenKind,
	gardenKey,
	gardenUrl,
	parseWikiLinks,
	stripCode,
} from "@/utils/wikiLinks";

export interface GardenSection {
	key: string;
	name: string;
	kind: GardenKind;
	url: string;
}

export interface GardenEntry {
	key: string;
	kind: GardenKind;
	id: string;
	title: string;
	url: string;
	description: string;
	date: Date;
	tags: string[];
	status: string[];
	section: GardenSection;
	body: string;
	entry: CollectionEntry<"note"> | CollectionEntry<"post">;
}

export interface GardenLink {
	source: string;
	target: string;
}

const toTitleCase = (str: string) =>
	str
		.replace(/[-_]+/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase())
		.trim();

export const DEFAULT_POST_SECTION = "Blog";

function noteSection(note: CollectionEntry<"note">): GardenSection {
	const name = getNoteCategory(note);
	const slug = slugifyCategory(name);
	return { key: `section:note:${slug}`, name, kind: "note", url: `/notes/category/${slug}/` };
}

/** A post's section is the top-level folder it lives in, e.g. `posts/journal/...` -> "Journal" */
function postSection(post: CollectionEntry<"post">): GardenSection {
	const rel = (post.filePath ?? post.id)
		.replace(/\\/g, "/")
		.replace(/^.*?src\/content\/posts\//, "");
	const segments = rel.split("/");
	const name = segments.length > 1 && segments[0] ? toTitleCase(segments[0]) : DEFAULT_POST_SECTION;
	return { key: `section:post:${slugifyCategory(name)}`, name, kind: "post", url: "/posts/" };
}

let cache: Promise<GardenEntry[]> | undefined;

/** Every note and published post, newest first */
export function getGardenEntries(): Promise<GardenEntry[]> {
	cache ??= (async () => {
		const [notes, posts] = await Promise.all([getAllNotes(), getAllPosts()]);
		const entries: GardenEntry[] = [
			...notes.map((note) => ({
				key: gardenKey({ kind: "note", id: note.id }),
				kind: "note" as const,
				id: note.id,
				title: note.data.title,
				url: gardenUrl({ kind: "note", id: note.id }),
				description: note.data.description ?? "",
				date: note.data.publishDate,
				tags: note.data.tags,
				status: note.data.status,
				section: noteSection(note),
				body: note.body ?? "",
				entry: note,
			})),
			...posts.map((post) => ({
				key: gardenKey({ kind: "post", id: post.id }),
				kind: "post" as const,
				id: post.id,
				title: post.data.title,
				url: gardenUrl({ kind: "post", id: post.id }),
				description: post.data.description,
				date: post.data.updatedDate ?? post.data.publishDate,
				tags: post.data.tags,
				status: post.data.status,
				section: postSection(post),
				body: post.body ?? "",
				entry: post,
			})),
		];
		return entries.sort((a, b) => b.date.valueOf() - a.date.valueOf());
	})();
	return cache;
}

/** Every resolved `[[wiki-link]]` in the garden, de-duplicated, as `source -> target` key pairs */
export function getGardenLinks(entries: GardenEntry[]): GardenLink[] {
	const byKey = new Map(entries.map((e) => [e.key, e]));
	const resolve = createWikiResolver(entries.map(({ kind, id, title }) => ({ kind, id, title })));
	const seen = new Set<string>();
	const links: GardenLink[] = [];
	for (const entry of entries) {
		for (const link of parseWikiLinks(stripCode(entry.body))) {
			const ref = resolve(link.target);
			const target = ref && gardenKey(ref);
			const pair = `${entry.key}\u0000${target}`;
			if (!target || !byKey.has(target) || target === entry.key || seen.has(pair)) continue;
			seen.add(pair);
			links.push({ source: entry.key, target });
		}
	}
	return links;
}

/** What an entry links to, and what links back to it */
export function getConnections(key: string, entries: GardenEntry[], links: GardenLink[]) {
	const byKey = new Map(entries.map((e) => [e.key, e]));
	const pick = (keys: string[]) =>
		keys.flatMap((k) => byKey.get(k) ?? []).sort((a, b) => b.date.valueOf() - a.date.valueOf());
	return {
		outgoing: pick(links.filter((l) => l.source === key).map((l) => l.target)),
		incoming: pick(links.filter((l) => l.target === key).map((l) => l.source)),
	};
}

/** Rough plain-text excerpt of a markdown body, for hover previews */
export function getExcerpt(body: string, maxLength = 280) {
	const text = stripCode(body)
		.replace(/^import\s.*$/gm, "") // mdx imports
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
