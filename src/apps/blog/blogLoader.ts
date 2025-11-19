import { cache } from "@solidjs/router";

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
    const response = await fetch('http://localhost:3000/api/blog');
    if (!response.ok) {
        throw new Error('Failed to load blog posts');
    }
    return (await response.json()) as BlogPost[];
}, "blog-posts");
