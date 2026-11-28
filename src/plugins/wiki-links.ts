import fs from "node:fs";
import path from "node:path";
import type { PhrasingContent } from "mdast";
import type { MdastPluginDefinition } from "satteri";
import {
	createWikiResolver,
	type GardenKind,
	gardenKey,
	gardenUrl,
	githubSlug,
	parseWikiLinks,
	WIKI_LINK_RE,
	type WikiRef,
} from "../utils/wikiLinks";

const CONTENT_DIRS: Record<GardenKind, string> = {
	note: path.resolve("src/content/notes"),
	post: path.resolve("src/content/posts"),
	journal: path.resolve("src/content/journal"),
};

const isProd = process.env.NODE_ENV === "production";

/** Read entry ids + titles straight from disk (content collections aren't available inside markdown plugins) */
function readIndex(kind: GardenKind): WikiRef[] {
	const dir = CONTENT_DIRS[kind];
	if (!fs.existsSync(dir)) return [];
	const refs: WikiRef[] = [];
	for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
		if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) continue;
		const file = path.join(entry.parentPath, entry.name);
		const rel = path
			.relative(dir, file)
			.replace(/\\/g, "/")
			.replace(/\.mdx?$/, "");
		const source = fs.readFileSync(file, "utf8");
		const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
		// drafts aren't built in production, so don't link to them
		if (isProd && kind !== "note" && /^draft:\s*true\s*$/m.test(frontmatter)) continue;
		const slugOverride = frontmatter.match(/^slug:\s*["']?(.+?)["']?\s*$/m)?.[1];
		const title = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? rel;
		const id =
			slugOverride ??
			rel
				.split("/")
				.map(githubSlug)
				.join("/")
				.replace(/\/index$/, "");
		refs.push({ kind, id, title });
	}
	return refs;
}

export function satteriWikiLinksPlugin(): () => MdastPluginDefinition {
	return () => {
		const resolve = createWikiResolver([
			...readIndex("note"),
			...readIndex("post"),
			...readIndex("journal"),
		]);

		return {
			name: "weisgarden-wiki-links",
			text(node, ctx) {
				if (!node.value.includes("[[")) return;
				const links = parseWikiLinks(node.value);
				if (links.length === 0) return;

				const parts: PhrasingContent[] = [];
				let cursor = 0;
				for (const match of node.value.matchAll(WIKI_LINK_RE)) {
					const link = links.shift();
					if (!link || match.index === undefined) continue;
					if (match.index > cursor) {
						parts.push({ type: "text", value: node.value.slice(cursor, match.index) });
					}
					cursor = match.index + match[0].length;

					const ref = resolve(link.target);
					if (!ref) {
						console.warn(`[wiki-links] Could not resolve [[${link.target}]]`);
						parts.push({
							type: "emphasis",
							children: [{ type: "text", value: link.label ?? link.target }],
							data: {
								hName: "span",
								hProperties: {
									className: ["wiki-link", "wiki-link-missing"],
									title: `Nothing in the garden matches "${link.target}"`,
								},
							},
						});
						continue;
					}

					const hash = link.heading ? `#${githubSlug(link.heading)}` : "";
					const text = link.label ?? (link.heading ? `${ref.title} › ${link.heading}` : ref.title);
					parts.push({
						type: "link",
						url: `${gardenUrl(ref)}${hash}`,
						children: [{ type: "text", value: text }],
						data: {
							hProperties: {
								className: ["wiki-link", `wiki-link-${ref.kind}`],
								"data-wiki-target": gardenKey(ref),
							},
						},
					});
				}
				if (cursor < node.value.length) {
					parts.push({ type: "text", value: node.value.slice(cursor) });
				}
				ctx.replaceNode(node, parts);
			},
		};
	};
}
