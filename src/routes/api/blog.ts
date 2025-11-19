import { json } from "@solidjs/router";
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';

export interface BlogPost {
    id: string;
    title: string;
    date: string;
    preview: string;
    slug: string;
    content: string;
    htmlContent: string;
}

export async function GET() {
    const contentDir = join(process.cwd(), 'content', 'blog');

    try {
        const files = await readdir(contentDir);
        const markdownFiles = files.filter((file: string) => file.endsWith('.md'));

        const posts = await Promise.all(
            markdownFiles.map(async (filename: string) => {
                const filePath = join(contentDir, filename);
                const fileContent = await readFile(filePath, 'utf-8');

                // Parse frontmatter and content
                const { data, content } = matter(fileContent);

                // Convert markdown to HTML
                const processedContent = await remark()
                    .use(remarkParse)
                    .use(remarkHtml, { sanitize: false })
                    .process(content);

                const htmlContent = processedContent.toString();

                return {
                    id: data.slug || filename.replace('.md', ''),
                    title: data.title || 'Untitled',
                    date: data.date || '',
                    preview: data.preview || '',
                    slug: data.slug || filename.replace('.md', ''),
                    content: content,
                    htmlContent: htmlContent,
                };
            })
        );

        // Sort by date (newest first)
        const sortedPosts = posts.sort((a: BlogPost, b: BlogPost) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return json(sortedPosts);
    } catch (error) {
        console.error('Error loading blog posts:', error);
        return json([], { status: 500 });
    }
}
