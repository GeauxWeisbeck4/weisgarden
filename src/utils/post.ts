import { type CollectionEntry, getCollection } from "astro:content";

/** filter out draft posts based on the environment */
export async function getAllPosts(): Promise<CollectionEntry<"post">[]> {
  return await getCollection("post", ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });
}

/** Get tag metadata by tag name */
export async function getTagMeta(tag: string): Promise<CollectionEntry<"tag"> | undefined> {
  const tagEntries = await getCollection("tag", (entry) => {
    return entry.id === tag;
  });
  return tagEntries[0];
}

/** 
 * Groups post by year (based on option siteConfig.sortPostsByUpdatedDate), using the year as the key. 
 * Note: Doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 */
export function groupPostsByYear(posts: CollectionEntry<"post">[]) {
  return posts.reduce<Record<string, CollectionEntry<"post">[]>>((acc, post) => {
    const year = post.data.publishDate.getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year]?.push(post);
    return acc;
  }, {});
}


/**
 * Returns all tags from posts
 *
 * @export getAllTags
 * @param {CollectionEntry<"post">[]} posts 
 * @returns {*} 
 */
export function getAllTags(posts: CollectionEntry<"post">[]) {
  return posts.flatMap((post) => [...post.data.tags]);
}

/** 
 * Returns all unique tags created from posts
 */
export function getUniqueTags(posts: CollectionEntry<"post">[]) {
  return [...new Set(getAllTags(posts))];
}

/** 
 * Returns a count of each uniquetag * - [[tagName, count], ...]
 */
export function getUniqueTagsWithCount(posts: CollectionEntry<"post">[]): [string, number][] {
  return [
    ...getAllTags(posts).reduce(
      (acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
      new Map<string, number>(),
    ),
  ].sort((a, b) => b[1] - a[1]);
}