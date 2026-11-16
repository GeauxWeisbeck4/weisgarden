import type { APIRoute } from "astro";
import { getAllNotes, getNoteCategory, getNoteExcerpt } from "@/data/note";
import { getFormattedDate } from "@/utils/date";

/** Data for the wiki-link hover previews, keyed by note id */
export const GET: APIRoute = async () => {
	const notes = await getAllNotes();
	const previews = Object.fromEntries(
		notes.map((note) => [
			note.id,
			{
				title: note.data.title,
				description: note.data.description ?? "",
				excerpt: getNoteExcerpt(note),
				category: getNoteCategory(note),
				date: getFormattedDate(note.data.publishDate),
				status: note.data.status,
			},
		]),
	);
	return new Response(JSON.stringify(previews), {
		headers: { "Content-Type": "application/json" },
	});
};
