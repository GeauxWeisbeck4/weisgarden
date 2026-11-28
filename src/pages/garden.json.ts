import type { APIRoute } from "astro";
import { getExcerpt, getGardenEntries, getGardenLinks, KIND_RANK } from "@/data/garden";
import { sprintKey, sprintUrl } from "@/data/journal";
import { getFormattedDate } from "@/utils/date";

/**
 * Everything the garden graph and the wiki-link hover previews need, in one file.
 * Fetched (and cached by the browser) on every page by the graph panel.
 */
export const GET: APIRoute = async () => {
	const entries = await getGardenEntries();
	const links = getGardenLinks(entries);

	const sections = [...new Map(entries.map((e) => [e.section.key, e.section])).values()]
		.sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind] || a.name.localeCompare(b.name))
		.map((s, i) => ({ ...s, color: i % 8 }));

	const postTags = new Set(entries.filter((e) => e.kind === "post").flatMap((e) => e.tags));
	const tags = [...new Set(entries.flatMap((e) => e.tags))].sort().map((tag) => ({
		key: `tag:${tag}`,
		name: `#${tag}`,
		// tag pages only list posts
		url: postTags.has(tag) ? `/tags/${encodeURIComponent(tag)}/` : undefined,
	}));

	const sprints = [...new Set(entries.flatMap((e) => (e.sprint === undefined ? [] : [e.sprint])))]
		.sort((a, b) => a - b)
		.map((sprint) => ({
			key: sprintKey(sprint),
			name: `Sprint ${sprint}`,
			url: sprintUrl(sprint),
		}));

	const data = {
		sections,
		tags,
		sprints,
		nodes: entries.map((e) => ({
			key: e.key,
			kind: e.kind,
			title: e.title,
			url: e.url,
			section: e.section.key,
			tags: e.tags.map((t) => `tag:${t}`),
			...(e.sprint !== undefined && { sprint: sprintKey(e.sprint) }),
			date: getFormattedDate(e.date),
			description: e.description,
			excerpt: getExcerpt(e.body),
			status: e.status,
		})),
		links,
	};

	return new Response(JSON.stringify(data), {
		headers: { "Content-Type": "application/json" },
	});
};
