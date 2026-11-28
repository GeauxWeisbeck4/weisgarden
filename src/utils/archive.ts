import { siteConfig } from "@/site.config";

export interface ArchiveMonth {
	/** 1-based month number */
	month: number;
	/** zero-padded month, used in URLs e.g. "03" */
	slug: string;
	label: string;
	count: number;
}

export interface ArchiveYear {
	year: number;
	count: number;
	months: ArchiveMonth[];
}

/** pads a 1-based month number for use in archive URLs */
export function monthSlug(month: number) {
	return month.toString().padStart(2, "0");
}

/** counts dates by year and month, newest first.
 *  Uses local date getters, the same as the rest of the site's date grouping and formatting. */
export function buildDateArchive(dates: Date[]): ArchiveYear[] {
	const years = new Map<number, Map<number, number>>();
	for (const date of dates) {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const months = years.get(year) ?? new Map<number, number>();
		months.set(month, (months.get(month) ?? 0) + 1);
		years.set(year, months);
	}

	const monthFormatter = new Intl.DateTimeFormat(siteConfig.lang, { month: "long" });

	return [...years]
		.sort(([a], [b]) => b - a)
		.map(([year, months]) => {
			const sortedMonths = [...months]
				.sort(([a], [b]) => b - a)
				.map(([month, count]) => ({
					month,
					slug: monthSlug(month),
					label: monthFormatter.format(new Date(year, month - 1, 1)),
					count,
				}));
			return {
				year,
				count: sortedMonths.reduce((sum, m) => sum + m.count, 0),
				months: sortedMonths,
			};
		});
}
