/**
 * Shared helpers for `[[wiki-links]]` between notes.
 *
 * Supported syntax:
 *   [[target]]             link text = the target note's title
 *   [[target|label]]       custom link text
 *   [[target#heading]]     link to a heading inside the note
 *
 * `target` may be a note id (`seedlings/my-note`), a file name (`my-note`) or a note title
 * (`My Note`), all matched case-insensitively.
 */

export interface WikiNoteRef {
	id: string;
	title: string;
}

export interface ParsedWikiLink {
	raw: string;
	target: string;
	heading?: string | undefined;
	label?: string | undefined;
}

export const WIKI_LINK_RE = /\[\[([^[\]|#\n]+)(?:#([^[\]|\n]+))?(?:\|([^[\]\n]+))?\]\]/g;

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

/** Build a resolver that maps a wiki-link target to a note */
export function createWikiResolver(notes: WikiNoteRef[]) {
	const byKey = new Map<string, WikiNoteRef>();
	const add = (key: string, note: WikiNoteRef) => {
		const k = normalise(key);
		if (k && !byKey.has(k)) byKey.set(k, note);
	};
	// precedence: exact id > title > file name
	for (const note of notes) add(note.id, note);
	for (const note of notes) add(note.title, note);
	for (const note of notes) add(note.id.split("/").at(-1) ?? "", note);

	return (target: string): WikiNoteRef | undefined => {
		const t = normalise(target);
		return byKey.get(t) ?? byKey.get(githubSlug(t)) ?? byKey.get(t.split("/").at(-1) ?? "");
	};
}

/** Remove fenced and inline code so `[[...]]` inside code isn't treated as a link */
export function stripCode(markdown: string) {
	return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, "").replace(/`[^`\n]*`/g, "");
}
