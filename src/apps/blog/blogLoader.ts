import { cache } from "@solidjs/router";
import type { blogPosts } from "~/db/schema";

type DbBlogPost = typeof blogPosts.$inferSelect;

export interface BlogPost {
    id: string;
    title: string;
    date: string;
    preview: string;
    slug: string;
    content: string;
    htmlContent: string;
}

export const getBlogPosts = cache(async () => {
    "use server";

    // Dynamically import server-only dependencies
    const { getAllPosts } = await import("~/db/queries");
    const { remark } = await import("remark");
    const html = (await import("remark-html")).default;

    const dbPosts: DbBlogPost[] = await getAllPosts(true);

    const posts: BlogPost[] = await Promise.all(
        dbPosts.map(async (post) => {
            // Render markdown to HTML on the fly
            // In a real app, we might cache this or store it in the DB
            const processedContent = await remark()
                .use(html)
                .process(post.contentMarkdown);
            const htmlContent = processedContent.toString();

            // Extract a preview from the content if not explicitly stored (we don't have a preview column in DB yet)
            // For now, let's just take the first 150 chars of plain text as preview
            const preview = post.contentMarkdown.slice(0, 150).replace(/[#*`]/g, '') + "...";

            return {
                id: post.id,
                title: post.title,
                date: post.createdAt.toISOString().split('T')[0],
                preview: preview,
                slug: post.slug,
                content: post.contentMarkdown,
                htmlContent: htmlContent,
            };
        })
    );

    return posts;
}, "blog-posts");
