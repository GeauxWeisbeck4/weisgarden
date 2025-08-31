import { getAllPosts } from "../utils/post";
import { siteConfig } from "../site.config";
import rss from "@astrojs/rss";

export const GET = async () => {
  const posts = await getAllPosts();

  return rss({
    stylesheet: '/rss/pretty-feed-v3.xsl',
    title: siteConfig.title,
    description: siteConfig.description,
    site: import.meta.env.SITE,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `posts/${post.id}/`,
    })),
  });
};