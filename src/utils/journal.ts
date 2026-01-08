import { type CollectionEntry, getCollection } from "astro:content";

/**
 * Filter all draft posts based on environment
 * 
 * @export getAllJournals
 * @param {CollectionEntry<"journal">[]} journals 
 * @returns {getCollection("journal", ({ data.draft }) )}
 */
export async function getAllJournals(): Promise<CollectionEntry<"journal">[]> {
  return await getCollection("journal", ({ data }) => {
    return import.meta.env.PROD ? !data.draft: true;
  });
} 

/**
 * Get tag metadata by tag name
 *
 * @export getTagMeta
 * @param {tag Promise<CollectionEntry<"tag"> } 
 * @returns {tagEntries[0]} 
 */
export async function getTagMeta(tag: string): Promise<CollectionEntry<"tag"> | undefined> {
  const tagEntries = await getCollection("tag", (entry) => {
    return entry.id === tag;
  });
  return tagEntries[0];
}

/**
 * Groups journal entries by year (based on option siteConfig.sortJournalsByUpdatedDate), using the year as the key. 
 * Note: Doesn't filter draft journals, pass it the result of getAllJournals above to do so.
 *
 * @export getJournalsByYear
 * @param {CollectionEntry<"journal">[]} journals 
 * @returns {*} 
 */
export function groupJournalsByYear(journals: CollectionEntry<"journal">[]) {
  return journals.reduce<Record<string, CollectionEntry<"journal">[]>>((acc, journal) => {
    const year = journal.data.publishDate.getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year]?.push(journal);
    return acc;
  }, {});
}

/** 
 * Groups journal entries by month and year, using "YYYY-MM" as the key. 
 * Note: Doesn't filter draft posts, pass it the result of getAllJournals above to do so.
 * @export groupJournalsByMonth
 * @param {CollectionEntry<"journals">[]} journals 
 * @returns {*} 
 */
export function groupJournalsByMonth(journals: CollectionEntry<"journal">[]) {
  return journals.reduce<Record<string, CollectionEntry<"journal">[]>>((acc, journal) => {
    const year = journal.data.publishDate.getFullYear();
    const month = String(journal.data.publishDate.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key]?.push(journal);
    return acc;
  }, {})
}

/** 
 * Returns all tags from journals
 *
 * @export getAllTags
 * @param {CollectionEntry<"journal">[]}
 * @returns {*}
 */
export function getAllTags(journals: CollectionEntry<"journal">[]) {
  return journals.flatMap((journal) => [...journal.data.tags]);
};

/** 
 * Returns all unique tags created from journals
 */
export function getUniqueTags(journals: CollectionEntry<"journal">[]) {
  return [...new Set(getAllTags(journals))];
};

/** 
 * Returns a count of each uniquetag * - [[tagName, count], ...]
 */
export function getUniqueTagsWithCount(journals: CollectionEntry<"journal">[]): [string, number][] {
  return [
    ...getAllTags(journals).reduce(
      (acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
      new Map<string, number>(),
    ),
  ].sort((a, b) => b[1] - a[1]);
};
