/**
 * Lightweight reading-time estimator.
 */
const WORDS_PER_MINUTE = 220;

export interface ReadingTime {
	/** Whole minutes, minimum 1. */
	minutes: number;
	/** Word Count */
	words: number;
}

export function readingTime(text: string): ReadingTime {
	const words = text
		.replace(/```[\s\S]*?```/g, " ") // strip fenced code
		.replace(/<[^>]+>/g, " ") // strip html
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.filter(Boolean).length;
	return {
		words,
		minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
	};
}
