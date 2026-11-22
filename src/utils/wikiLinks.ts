/**
 * Shared helpers for `[[wiki-links]]` between notes and posts.
 *
 * Supported syntax:
 *   [[target]]             link text = the target's title
 *   [[target|label]]       custom link text
 *   [[target#heading]]     link to a heading inside the note/post
 *   [[posts/target]]       only look in posts
 *   [[notes/target]]       only look in notes
 *
 * (`post:target` / `note:target` also resolve, but in markdown files `:target` is parsed as a
 * text directive before this plugin sees it, so prefer the slash form.)
 *
 * `target` may be an entry id (`seedlings/my-note`), a file name (`my-note`) or a title
 * (`My Note`), all matched case-insensitively. Without a prefix, notes win over posts when both match.
 */

export type GardenKind = "note" | "post";

export interface WikiRef {
	kind: GardenKind;
	id: string;
	title: string;
}

/** @deprecated kept for older imports, use WikiRef */
export type WikiNoteRef = WikiRef;

export interface ParsedWikiLink {
	raw: string;
	target: string;
	heading?: string | undefined;
	label?: string | undefined;
}

export const WIKI_LINK_RE = /\[\[([^[\]|#\n]+)(?:#([^[\]|\n]+))?(?:\|([^[\]\n]+))?\]\]/g;

/** Unique key for an entry across collections, e.g. `note:welcome` or `post:journal/foo` */
export const gardenKey = (ref: Pick<WikiRef, "kind" | "id">) => `${ref.kind}:${ref.id}`;

export const gardenUrl = (ref: Pick<WikiRef, "kind" | "id">) =>
	`/${ref.kind === "note" ? "notes" : "posts"}/${ref.id}/`;

/** Mirrors github-slugger, which Astro's glob loader uses to build entry ids. */
export function githubSlug(value: string) {
	return value
		.toLowerCase()
		.replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "")
		.replace(/ /g, "-");
}

export function parseWikiLinks(text: string): ParsedWikiLink[] {
	return [...text.matchAll(WIKI_LINK_RE)].map((m) => ({
		raw: m[0],
		target: (m[1] ?? "").trim(),
		heading: m[2]?.trim(),
		label: m[3]?.trim(),
	}));
}

const normalise = (s: string) =>
	s
		.trim()
		.toLowerCase()
		.replace(/\.mdx?$/, "");

const PREFIX_RE = /^(note|post)s?[:/]\s*/i;

/** Build a resolver that maps a wiki-link target to a note or post */
export function createWikiResolver(refs: WikiRef[]) {
	// notes first so an un-prefixed target prefers a note
	const ordered = [...refs].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "note" ? -1 : 1));
	const maps = { any: new Map<string, WikiRef>(), note: new Map(), post: new Map() } as Record<
		"any" | GardenKind,
		Map<string, WikiRef>
	>;
	const add = (key: string, ref: WikiRef) => {
		const k = normalise(key);
		if (!k) return;
		for (const map of [maps.any, maps[ref.kind]]) if (!map.has(k)) map.set(k, ref);
	};
	// precedence: exact id > title > file name
	for (const ref of ordered) add(ref.id, ref);
	for (const ref of ordered) add(ref.title, ref);
	for (const ref of ordered) add(ref.id.split("/").at(-1) ?? "", ref);

	return (target: string): WikiRef | undefined => {
		let t = normalise(target);
		let map = maps.any;
		const prefix = t.match(PREFIX_RE);
		if (prefix) {
			map = maps[prefix[1]?.toLowerCase() as GardenKind];
			t = t.slice(prefix[0].length);
		}
		return map.get(t) ?? map.get(githubSlug(t)) ?? map.get(t.split("/").at(-1) ?? "");
	};
}

/** Remove fenced and inline code so `[[...]]` inside code isn't treated as a link */
export function stripCode(markdown: string) {
	return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, "").replace(/`[^`\n]*`/g, "");
}
