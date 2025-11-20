import { APIEvent } from "@solidjs/start/server";

export async function POST({ request }: APIEvent) {
    try {
        // Dynamically import DB queries to prevent build-time bundling of native modules
        const { createPost, updatePost, getUserByHandle } = await import("~/db/queries");

        const body = await request.json();
        const { id, title, date, preview, slug, content } = body;

        if (!title || !content) {
            return new Response(JSON.stringify({ error: 'Title and content are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Ensure admin user exists for authorship (temporary until real auth)
        const adminUser = await getUserByHandle("byte");
        if (!adminUser) {
            throw new Error("Admin user not found");
        }

        let savedPost;
        if (id) {
            // Update existing post
            savedPost = await updatePost(id, {
                title,
                slug,
                contentMarkdown: content,
                published: true, // Auto-publish for now
            });
        } else {
            // Create new post
            savedPost = await createPost(
                adminUser.id,
                title,
                slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                content,
                true // Auto-publish
            );
        }

        return new Response(JSON.stringify({
            success: true,
            filename: savedPost.slug, // Keeping 'filename' key for compatibility with frontend message
            id: savedPost.id
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error saving post:', error);
        return new Response(JSON.stringify({ error: 'Failed to save post' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
