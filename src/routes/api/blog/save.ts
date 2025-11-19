import { json } from "@solidjs/router";
import { writeFile } from 'fs/promises';
import { join } from 'path';

interface BlogPostData {
    title: string;
    date: string;
    preview: string;
    slug: string;
    content: string;
}

export async function POST({ request }: { request: Request }) {
    try {
        const data: BlogPostData = await request.json();

        // Validate required fields
        if (!data.title || !data.content) {
            return json({ error: 'Title and content are required' }, { status: 400 });
        }

        // Generate filename: YYYY-MM-DD-slug.md
        const filename = `${data.date}-${data.slug}.md`;

        // Create frontmatter + content
        const fileContent = `---
title: "${data.title}"
date: "${data.date}"
preview: "${data.preview}"
slug: "${data.slug}"
---

${data.content}`;

        // Write to content/blog/filename
        const filePath = join(process.cwd(), 'content', 'blog', filename);
        await writeFile(filePath, fileContent, 'utf-8');

        return json({ success: true, filename });
    } catch (error) {
        console.error('Error saving blog post:', error);
        return json({ error: 'Failed to save blog post' }, { status: 500 });
    }
}
