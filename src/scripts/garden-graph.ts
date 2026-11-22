/**
 * <garden-graph variant="mini|full">
 *
 * Force-directed graph of every note and post in the garden. Contains an <svg data-svg> and,
 * optionally, `input[data-opt]` checkboxes (notes, posts, sections, tags, local) that toggle what's shown.
 *
 * - `mini`: compact, laid out instantly, labels on hover, focuses the page you're on
 * - `full`: animated, labels always on, focus comes from `?focus=<key>`
 */
import { type GardenData, type GardenNodeData, loadGarden, normalisePath } from "./garden-data";

type Shape = "note" | "post" | "section" | "tag";
type EdgeType = "link" | "section" | "tag";

export interface GardenGraphOptions {
	notes: boolean;
	posts: boolean;
	sections: boolean;
	tags: boolean;
	/** only show the neighbourhood of the focused node */
	local: boolean;
}

export interface GardenGraphBuiltDetail {
	focus?: { key: string; label: string; url?: string | undefined } | undefined;
	nodes: number;
	links: number;
	options: GardenGraphOptions;
}

interface SimNode {
	key: string;
	label: string;
	url?: string | undefined;
	shape: Shape;
	color: number | undefined;
	r: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	fixed: boolean;
	el?: SVGGElement;
}

interface SimEdge {
	a: SimNode;
	b: SimNode;
	type: EdgeType;
	el?: SVGLineElement;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const LOCAL_DEPTH = 2;
const LOCAL_MAX_NODES = 60;

const svgEl = <K extends keyof SVGElementTagNameMap>(
	tag: K,
	attrs: Record<string, string> = {},
) => {
	const el = document.createElementNS(SVG_NS, tag);
	for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
	return el;
};
const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Small deterministic PRNG so a node starts in the same place on every page */
function seeded(key: string) {
	let h = 1779033703 ^ key.length;
	for (let i = 0; i < key.length; i++) {
		h = Math.imul(h ^ key.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	return () => {
		h = Math.imul(h ^ (h >>> 16), 2246822507);
		h = Math.imul(h ^ (h >>> 13), 3266489909);
		h ^= h >>> 16;
		return (h >>> 0) / 4294967296;
	};
}

export class GardenGraph extends HTMLElement {
	options: GardenGraphOptions = {
		notes: true,
		posts: true,
		sections: true,
		tags: false,
		local: false,
	};
	focusKey: string | undefined;

	#mini = true;
	#data: GardenData | undefined;
	#nodes: SimNode[] = [];
	#edges: SimEdge[] = [];
	#svg!: SVGSVGElement;
	#edgesG!: SVGGElement;
	#nodesG!: SVGGElement;
	#view = { x: 0, y: 0, k: 1 };
	#alpha = 1;
	#frame = 0;
	#userMoved = false;
	#reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	connectedCallback() {
		this.#mini = this.getAttribute("variant") !== "full";
		this.#svg = this.querySelector("svg[data-svg]") ?? this.appendChild(svgEl("svg"));
		this.#svg.classList.add("garden-svg");
		this.#edgesG = svgEl("g");
		this.#nodesG = svgEl("g");
		this.#svg.replaceChildren(this.#edgesG, this.#nodesG);

		for (const input of this.querySelectorAll<HTMLInputElement>("input[data-opt]")) {
			const opt = input.dataset.opt as keyof GardenGraphOptions;
			if (opt in this.options) this.options[opt] = input.checked;
			input.addEventListener("change", () => this.setOptions({ [opt]: input.checked }));
		}
		this.querySelector("[data-reset]")?.addEventListener("click", () => this.#build());

		this.#bindPanZoom();
		new ResizeObserver(() => {
			if (this.#alpha <= 0.02 && !this.#userMoved) this.#fit();
		}).observe(this.#svg);

		loadGarden().then((data) => {
			this.#data = data;
			this.focusKey = this.#resolveFocus(data);
			if (this.#mini) {
				this.options.local = !!this.focusKey;
				this.options.tags = this.options.local;
			}
			this.#build();
		});
	}

	disconnectedCallback() {
		cancelAnimationFrame(this.#frame);
	}

	setOptions(patch: Partial<GardenGraphOptions>) {
		Object.assign(this.options, patch);
		for (const input of this.querySelectorAll<HTMLInputElement>("input[data-opt]")) {
			const opt = input.dataset.opt as keyof GardenGraphOptions;
			if (opt in patch) input.checked = this.options[opt];
		}
		if (this.#data) this.#build();
	}

	/** Which node is "you are here": `?focus=` on the full graph, the current URL elsewhere */
	#resolveFocus(data: GardenData): string | undefined {
		const explicit =
			this.getAttribute("focus") ?? new URLSearchParams(location.search).get("focus");
		if (explicit) {
			// old /notes/graph/?focus=<note id> links
			const key = explicit.includes(":") ? explicit : `note:${explicit}`;
			return [...data.nodes, ...data.sections, ...data.tags].some((n) => n.key === key)
				? key
				: undefined;
		}
		if (!this.#mini) return undefined;
		const here = normalisePath(location.pathname);
		return (
			data.nodes.find((n) => normalisePath(n.url) === here)?.key ??
			data.sections.find((s) => s.kind === "note" && normalisePath(s.url) === here)?.key ??
			data.tags.find((t) => t.url && here.startsWith(normalisePath(t.url)))?.key
		);
	}

	get #size() {
		const { width, height } = this.#svg.getBoundingClientRect();
		return { w: width || 300, h: height || 240 };
	}

	#build() {
		const data = this.#data;
		if (!data) return;
		const o = this.options;
		const sectionColor = new Map(data.sections.map((s) => [s.key, s.color]));
		const nodes = new Map<string, SimNode>();
		const edges: SimEdge[] = [];

		const makeNode = (
			key: string,
			label: string,
			shape: Shape,
			color: number | undefined,
			url?: string,
		) => {
			const rand = seeded(key);
			const node: SimNode = {
				key,
				label,
				url,
				shape,
				color,
				r: 0,
				x: (rand() - 0.5) * 600,
				y: (rand() - 0.5) * 400,
				vx: 0,
				vy: 0,
				fixed: false,
			};
			nodes.set(key, node);
			return node;
		};

		const entries = data.nodes.filter((n) => (n.kind === "note" ? o.notes : o.posts));
		for (const n of entries) makeNode(n.key, n.title, n.kind, sectionColor.get(n.section), n.url);

		for (const l of data.links) {
			const a = nodes.get(l.source);
			const b = nodes.get(l.target);
			if (a && b) edges.push({ a, b, type: "link" });
		}

		const addHub = (
			key: string,
			label: string,
			shape: Shape,
			color: number | undefined,
			url: string | undefined,
			members: GardenNodeData[],
			type: EdgeType,
			min: number,
		) => {
			const present = members.filter((m) => nodes.has(m.key));
			if (present.length < min) return;
			const hub = makeNode(key, label, shape, color, url);
			for (const m of present) edges.push({ a: hub, b: nodes.get(m.key)!, type });
		};

		if (o.sections) {
			for (const s of data.sections) {
				const members = entries.filter((n) => n.section === s.key);
				const label = `${s.name} ${s.kind === "note" ? "notes" : "posts"}`;
				addHub(s.key, label, "section", s.color, s.url, members, "section", 1);
			}
		}
		if (o.tags) {
			for (const t of data.tags) {
				const members = entries.filter((n) => n.tags.includes(t.key));
				// a tag only tells you something when it joins two or more things
				addHub(t.key, t.name, "tag", undefined, t.url, members, "tag", 2);
			}
		}

		let keep: Set<string> | undefined;
		if (o.local && this.focusKey && nodes.has(this.focusKey)) {
			keep = this.#neighbourhood(this.focusKey, edges);
		}
		this.#nodes = [...nodes.values()].filter((n) => !keep || keep.has(n.key));
		this.#edges = edges.filter((e) => !keep || (keep.has(e.a.key) && keep.has(e.b.key)));

		const degree = new Map<SimNode, number>();
		for (const e of this.#edges) {
			if (e.type !== "link") continue;
			degree.set(e.a, (degree.get(e.a) ?? 0) + 1);
			degree.set(e.b, (degree.get(e.b) ?? 0) + 1);
		}
		for (const n of this.#nodes) {
			const d = Math.min(degree.get(n) ?? 0, 6);
			if (this.#mini) {
				n.r = n.shape === "section" ? 4.5 : n.shape === "tag" ? 3 : 3.5 + d * 0.6;
				if (n.key === this.focusKey) n.r += 2;
			} else {
				n.r = n.shape === "section" ? 9 : n.shape === "tag" ? 5.5 : 6 + d * 1.4;
			}
		}

		this.#render();
		this.#userMoved = false;
		this.#alpha = 1;
		if (this.#mini || this.#reducedMotion) {
			while (this.#alpha > 0.02) this.#tick();
			this.#fit();
		} else {
			this.#fit();
			this.#run();
		}

		const focus = this.focusKey ? nodes.get(this.focusKey) : undefined;
		this.dispatchEvent(
			new CustomEvent<GardenGraphBuiltDetail>("garden:built", {
				bubbles: true,
				detail: {
					focus: focus && { key: focus.key, label: focus.label, url: focus.url },
					nodes: this.#nodes.filter((n) => n.shape === "note" || n.shape === "post").length,
					links: this.#edges.filter((e) => e.type === "link").length,
					options: { ...this.options },
				},
			}),
		);
	}

	/** Breadth-first walk out from `start`, LOCAL_DEPTH steps along any kind of edge */
	#neighbourhood(start: string, edges: SimEdge[]) {
		const adj = new Map<string, string[]>();
		for (const e of edges) {
			adj.set(e.a.key, [...(adj.get(e.a.key) ?? []), e.b.key]);
			adj.set(e.b.key, [...(adj.get(e.b.key) ?? []), e.a.key]);
		}
		const seen = new Set([start]);
		let frontier = [start];
		for (let depth = 0; depth < LOCAL_DEPTH && frontier.length; depth++) {
			const next: string[] = [];
			for (const key of frontier) {
				for (const n of adj.get(key) ?? []) {
					if (seen.has(n) || seen.size >= LOCAL_MAX_NODES) continue;
					seen.add(n);
					next.push(n);
				}
			}
			frontier = next;
		}
		return seen;
	}

	#render() {
		this.#edgesG.replaceChildren();
		this.#nodesG.replaceChildren();
		this.#svg.classList.toggle("is-mini", this.#mini);

		for (const e of this.#edges) {
			e.el = svgEl("line", { class: `g-edge is-${e.type}` });
			this.#edgesG.append(e.el);
		}

		for (const n of this.#nodes) {
			const g = svgEl("g", { class: `g-node is-${n.shape}` });
			if (n.key === this.focusKey) g.classList.add("is-focus");
			const color = n.color === undefined ? "var(--graph-tag)" : `var(--graph-c${n.color})`;

			let mark: SVGElement;
			if (n.shape === "post" || n.shape === "tag") {
				const s = n.shape === "tag" ? n.r * 1.5 : n.r * 1.75;
				mark = svgEl("rect", {
					x: String(-s / 2),
					y: String(-s / 2),
					width: String(s),
					height: String(s),
					rx: n.shape === "tag" ? "1" : String(s * 0.22),
					transform: n.shape === "tag" ? "rotate(45)" : "",
				});
			} else {
				mark = svgEl("circle", { r: String(n.r) });
			}
			mark.classList.add("g-mark");
			mark.style.fill = n.shape === "section" ? "var(--color-global-bg)" : color;
			if (n.shape === "section") mark.style.stroke = color;

			const text = svgEl(
				"text",
				this.#mini
					? { x: "0", y: String(n.r + 10), "text-anchor": "middle" }
					: { x: String(n.r + 4), y: "4" },
			);
			text.textContent = truncate(n.label, this.#mini ? 26 : 34);
			const title = svgEl("title");
			title.textContent = n.label;
			g.append(mark, text, title);
			this.#bindNode(g, n);
			n.el = g;
			this.#nodesG.append(g);
		}
	}

	#tick() {
		const nodes = this.#nodes;
		const alpha = this.#alpha;

		// repulsion
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				const a = nodes[i]!;
				const b = nodes[j]!;
				let dx = b.x - a.x;
				let dy = b.y - a.y;
				let d2 = dx * dx + dy * dy;
				if (d2 < 0.01) {
					dx = 0.5;
					dy = 0.5;
					d2 = 0.5;
				}
				const force = (2400 * alpha) / d2;
				const d = Math.sqrt(d2);
				const fx = (dx / d) * force;
				const fy = (dy / d) * force;
				a.vx -= fx;
				a.vy -= fy;
				b.vx += fx;
				b.vy += fy;
			}
		}
		// springs
		for (const e of this.#edges) {
			const dx = e.b.x - e.a.x;
			const dy = e.b.y - e.a.y;
			const d = Math.sqrt(dx * dx + dy * dy) || 1;
			const rest = e.type === "link" ? 100 : e.type === "section" ? 60 : 80;
			const k = (e.type === "link" ? 0.06 : e.type === "section" ? 0.04 : 0.025) * alpha;
			const f = (d - rest) * k;
			const fx = (dx / d) * f;
			const fy = (dy / d) * f;
			e.a.vx += fx;
			e.a.vy += fy;
			e.b.vx -= fx;
			e.b.vy -= fy;
		}
		// gravity + integrate
		for (const n of nodes) {
			n.vx -= n.x * 0.012 * alpha;
			n.vy -= n.y * 0.012 * alpha;
			if (n.fixed) {
				n.vx = 0;
				n.vy = 0;
				continue;
			}
			n.vx *= 0.6;
			n.vy *= 0.6;
			n.x += n.vx;
			n.y += n.vy;
		}
		this.#alpha = Math.max(0, alpha * 0.985);
	}

	/** Positions are scaled into screen space so nodes and labels stay the same size at any zoom */
	#draw() {
		const { x, y, k } = this.#view;
		for (const e of this.#edges) {
			e.el?.setAttribute("x1", String(e.a.x * k + x));
			e.el?.setAttribute("y1", String(e.a.y * k + y));
			e.el?.setAttribute("x2", String(e.b.x * k + x));
			e.el?.setAttribute("y2", String(e.b.y * k + y));
		}
		for (const n of this.#nodes) {
			n.el?.setAttribute("transform", `translate(${n.x * k + x},${n.y * k + y})`);
		}
	}

	#run() {
		cancelAnimationFrame(this.#frame);
		const step = () => {
			this.#tick();
			if (!this.#userMoved) this.#fit();
			else this.#draw();
			if (this.#alpha > 0.02) this.#frame = requestAnimationFrame(step);
		};
		this.#frame = requestAnimationFrame(step);
	}

	#reheat(alpha = 0.3) {
		if (this.#reducedMotion) return;
		this.#alpha = Math.max(this.#alpha, alpha);
		this.#run();
	}

	/** zoom/pan so every node is visible */
	#fit() {
		if (!this.#nodes.length) {
			this.#draw();
			return;
		}
		const { w, h } = this.#size;
		const pad = this.#mini ? 18 : 40;
		const labelRoom = this.#mini ? 0 : 140;
		const xs = this.#nodes.map((n) => n.x);
		const ys = this.#nodes.map((n) => n.y);
		const minX = Math.min(...xs);
		const maxX = Math.max(...xs);
		const minY = Math.min(...ys);
		const maxY = Math.max(...ys);
		const k = Math.min(
			this.#mini ? 1 : 1.4,
			(w - pad * 2 - labelRoom) / Math.max(maxX - minX, 1),
			(h - pad * 2 - (this.#mini ? 12 : 0)) / Math.max(maxY - minY, 1),
		);
		this.#view = {
			k,
			x: (w - labelRoom) / 2 - ((minX + maxX) / 2) * k,
			y: h / 2 - ((minY + maxY) / 2) * k - (this.#mini ? 4 : 0),
		};
		this.#draw();
	}

	#toGraph(clientX: number, clientY: number) {
		const rect = this.#svg.getBoundingClientRect();
		return {
			x: (clientX - rect.left - this.#view.x) / this.#view.k,
			y: (clientY - rect.top - this.#view.y) / this.#view.k,
		};
	}

	#highlight(node?: SimNode) {
		this.#svg.classList.toggle("is-hovering", !!node);
		if (!node) return;
		const lit = new Set<SimNode>([node]);
		for (const e of this.#edges) {
			const on = e.a === node || e.b === node;
			e.el?.classList.toggle("is-lit", on);
			if (on) {
				lit.add(e.a);
				lit.add(e.b);
			}
		}
		for (const n of this.#nodes) n.el?.classList.toggle("is-lit", lit.has(n));
		// keep the hovered node's label on top of its neighbours
		if (node.el) this.#nodesG.append(node.el);
	}

	#bindNode(g: SVGGElement, n: SimNode) {
		let start: { x: number; y: number } | undefined;
		let moved = false;

		g.addEventListener("pointerenter", () => this.#highlight(n));
		g.addEventListener("pointerleave", () => !start && this.#highlight());
		g.addEventListener("pointerdown", (e) => {
			e.stopPropagation();
			g.setPointerCapture(e.pointerId);
			start = { x: e.clientX, y: e.clientY };
			moved = false;
			n.fixed = true;
		});
		g.addEventListener("pointermove", (e) => {
			if (!start) return;
			if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 4) moved = true;
			if (!moved) return;
			this.#userMoved = true;
			const p = this.#toGraph(e.clientX, e.clientY);
			n.x = p.x;
			n.y = p.y;
			this.#draw();
			this.#reheat(0.15);
		});
		const end = () => {
			start = undefined;
			n.fixed = false;
		};
		g.addEventListener("pointerup", () => {
			const wasClick = !!start && !moved;
			end();
			if (wasClick && n.url) window.location.href = n.url;
		});
		g.addEventListener("pointercancel", end);
	}

	#bindPanZoom() {
		let pan: { x: number; y: number; vx: number; vy: number } | undefined;
		this.#svg.addEventListener("pointerdown", (e) => {
			this.#svg.setPointerCapture(e.pointerId);
			this.#svg.classList.add("is-panning");
			pan = { x: e.clientX, y: e.clientY, vx: this.#view.x, vy: this.#view.y };
		});
		this.#svg.addEventListener("pointermove", (e) => {
			if (!pan) return;
			this.#userMoved = true;
			this.#view.x = pan.vx + e.clientX - pan.x;
			this.#view.y = pan.vy + e.clientY - pan.y;
			this.#draw();
		});
		const end = () => {
			pan = undefined;
			this.#svg.classList.remove("is-panning");
		};
		this.#svg.addEventListener("pointerup", end);
		this.#svg.addEventListener("pointercancel", end);
		this.#svg.addEventListener(
			"wheel",
			(e) => {
				// the mini graph sits next to the page, so only zoom on pinch / ctrl+scroll there
				if (this.#mini && !e.ctrlKey && !e.metaKey) return;
				e.preventDefault();
				this.#userMoved = true;
				const rect = this.#svg.getBoundingClientRect();
				const mx = e.clientX - rect.left;
				const my = e.clientY - rect.top;
				const k = Math.min(6, Math.max(0.05, this.#view.k * Math.exp(-e.deltaY * 0.0015)));
				const ratio = k / this.#view.k;
				this.#view = {
					k,
					x: mx - (mx - this.#view.x) * ratio,
					y: my - (my - this.#view.y) * ratio,
				};
				this.#draw();
			},
			{ passive: false },
		);
	}
}

if (!customElements.get("garden-graph")) customElements.define("garden-graph", GardenGraph);
