/** Client-side loader for /garden.json, shared by the graph panel, graph page and link previews */

export type GardenKind = "note" | "post";

export interface GardenSectionData {
	key: string;
	name: string;
	kind: GardenKind;
	url: string;
	color: number;
}

export interface GardenTagData {
	key: string;
	name: string;
	url?: string;
}

export interface GardenNodeData {
	key: string;
	kind: GardenKind;
	title: string;
	url: string;
	section: string;
	tags: string[];
	date: string;
	description: string;
	excerpt: string;
	status: string[];
}

export interface GardenData {
	sections: GardenSectionData[];
	tags: GardenTagData[];
	nodes: GardenNodeData[];
	links: { source: string; target: string }[];
}

const EMPTY: GardenData = { sections: [], tags: [], nodes: [], links: [] };

let promise: Promise<GardenData> | undefined;

export function loadGarden(): Promise<GardenData> {
	const url =
		document.querySelector<HTMLMetaElement>('meta[name="garden-data"]')?.content ?? "/garden.json";
	promise ??= fetch(url)
		.then((r) => (r.ok ? (r.json() as Promise<GardenData>) : EMPTY))
		.catch(() => EMPTY);
	return promise;
}

/** `/notes/foo` and `/notes/foo/` compare equal */
export const normalisePath = (p: string) => {
	const path = decodeURI(p).replace(/\/index\.html$/, "/");
	return path.endsWith("/") ? path : `${path}/`;
};
