import { Component, createSignal, For, Show, onMount, createResource } from "solid-js";
import { revalidate, createAsync } from "@solidjs/router";
import { ResizableSplitPane } from "~/components/ResizableSplitPane";
import { getBlogPosts, type BlogPost } from "~/apps/blog/blogLoader";

interface LocalDraft {
    title: string;
    date: string;
    preview: string;
    slug: string;
    content: string;
    savedAt: string;
}

async function fetchSession() {
    try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

export const EditPanel: Component = () => {
    const posts = createAsync(() => getBlogPosts());
    const [session] = createResource(fetchSession);
    const [selectedPostId, setSelectedPostId] = createSignal<string | null>(null);

    const [title, setTitle] = createSignal("");
    const [date, setDate] = createSignal(new Date().toISOString().split('T')[0]);
    const [preview, setPreview] = createSignal("");
    const [slug, setSlug] = createSignal("");
    const [content, setContent] = createSignal("");
    const [saving, setSaving] = createSignal(false);
    const [message, setMessage] = createSignal("");

    const isAdmin = () => session()?.user?.role === 'admin';

    // Auto-generate slug from title
    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        // Only auto-update slug if we are creating a new post (no selected ID)
        if (!selectedPostId()) {
            const autoSlug = newTitle
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setSlug(autoSlug);
        }
    };

    const selectPost = (post: BlogPost) => {
        setSelectedPostId(post.id);
        setTitle(post.title);
        setDate(post.date);
        setPreview(post.preview);
        setSlug(post.slug);
        setContent(post.content);
        setMessage("");
    };

    const createNewPost = () => {
        setSelectedPostId(null);
        setTitle("");
        setDate(new Date().toISOString().split('T')[0]);
        setPreview("");
        setSlug("");
        setContent("");
        setMessage("");
    };

    // Load draft from localStorage on mount
    onMount(() => {
        const savedDraft = localStorage.getItem('edit-draft');
        if (savedDraft) {
            try {
                const draft: LocalDraft = JSON.parse(savedDraft);
                setTitle(draft.title);
                setDate(draft.date);
                setPreview(draft.preview);
                setSlug(draft.slug);
                setContent(draft.content);
                setMessage(`📝 Loaded draft from ${new Date(draft.savedAt).toLocaleString()}`);
                setTimeout(() => setMessage(""), 3000);
            } catch (error) {
                console.error('Failed to load draft:', error);
            }
        }
    });

    const saveToLocalStorage = () => {
        if (!title() || !content()) {
            setMessage("Title and content are required");
            return;
        }

        const draft: LocalDraft = {
            title: title(),
            date: date(),
            preview: preview(),
            slug: slug(),
            content: content(),
            savedAt: new Date().toISOString(),
        };

        localStorage.setItem('edit-draft', JSON.stringify(draft));
        setMessage(`✓ Saved to browser storage `);
        setTimeout(() => setMessage(""), 3000);
    };

    const publishPost = async () => {
        if (!title() || !content()) {
            setMessage("Title and content are required");
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            const response = await fetch('/api/blog/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedPostId(),
                    title: title(),
                    date: date(),
                    preview: preview(),
                    slug: slug(),
                    content: content(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to publish post');
            }

            setMessage(`✓ Published as ${result.filename} `);

            // Clear localStorage draft if exists
            localStorage.removeItem('edit-draft');

            // Invalidate blog posts cache to refresh the list
            await revalidate("blog-posts");

            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (error) {
            setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'} `);
        } finally {
            setSaving(false);
        }
    };

    const savePost = () => {
        if (isAdmin()) {
            publishPost();
        } else {
            saveToLocalStorage();
        }
    };

    return (
        <ResizableSplitPane
            initialLeftWidth={300}
            minLeftWidth={250}
            maxLeftWidth={500}
            left={
                <div class="h-full w-full border-r border-border flex flex-col bg-surface">
                    <Show when={isAdmin()} fallback={
                        <div class="flex items-center justify-center h-full p-8">
                            <div class="text-center">
                                <div class="text-4xl mb-4 text-text-muted">📝</div>
                                <h3 class="font-bold text-text-main mb-2">Draft Mode</h3>
                                <p class="text-sm text-text-muted">
                                    Your work is saved locally in your browser.
                                    Sign in as admin to publish posts.
                                </p>
                            </div>
                        </div>
                    }>
                        <div class="p-4 border-b border-border flex justify-between items-center">
                            <span class="font-bold text-sm text-text-muted uppercase tracking-wider">All Posts</span>
                            <button
                                onClick={createNewPost}
                                class="text-accent hover:text-text-main transition-colors"
                                title="New Post"
                            >
                                +
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto px-0 py-0">
                            <Show when={posts()} fallback={<div class="text-text-muted p-4">Loading posts...</div>}>
                                <div class="px-2 py-0 space-y-2">
                                    <For each={posts()}>
                                        {(post) => (
                                            <div
                                                onClick={() => selectPost(post)}
                                                class={`p-2 rounded border transition-all cursor-pointer shadow-sm group ${selectedPostId() === post.id
                                                    ? "bg-surface border-accent"
                                                    : "border-transparent hover:bg-surface hover:border-border"
                                                    }`}
                                            >
                                                <h4 class={`font-bold text-sm mb-1 truncate ${selectedPostId() === post.id ? "text-accent" : "text-text-main"}`}>
                                                    {post.title}
                                                </h4>
                                                <p class="text-xs text-text-faint truncate">
                                                    {post.date}
                                                </p>
                                            </div>
                                        )}
                                    </For>
                                </div>
                            </Show>
                        </div>
                    </Show>
                </div>
            }
            right={
                <div class="h-full w-full flex flex-col bg-background p-8 overflow-y-auto">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h1 class="text-2xl font-bold text-text-main">
                                {selectedPostId() ? "Edit Post" : "Create New Post"}
                            </h1>
                            <Show when={!isAdmin() && !session.loading}>
                                <p class="text-xs text-text-muted mt-1">
                                    📝 Public mode: Posts save to your browser only
                                </p>
                            </Show>
                        </div>
                        <div class="flex items-center gap-4">
                            {message() && (
                                <span class={`text-sm font-mono ${message().startsWith('✓') || message().startsWith('📝') ? 'text-accent' : 'text-error'}`}>
                                    {message()}
                                </span>
                            )}
                            <button
                                onClick={savePost}
                                disabled={saving()}
                                class="px-6 py-2 bg-accent text-background font-bold rounded hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isAdmin() ? 'Publish to public site' : 'Save to browser storage'}
                            >
                                {saving() ? "Saving..." : isAdmin() ? "Publish" : "Save to Browser"}
                            </button>
                        </div>
                    </div>

                    {/* Frontmatter Fields */}
                    <div class="space-y-4 mb-6">
                        <div>
                            <label class="block text-sm font-mono text-text-muted mb-2">Title *</label>
                            <input
                                type="text"
                                value={title()}
                                onInput={(e) => handleTitleChange(e.currentTarget.value)}
                                class="w-full bg-surface border border-border rounded px-4 py-2 text-text-main outline-none focus:border-accent transition-colors"
                                placeholder="The Case for Tiling Interfaces"
                            />
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-mono text-text-muted mb-2">Date</label>
                                <input
                                    type="date"
                                    value={date()}
                                    onInput={(e) => setDate(e.currentTarget.value)}
                                    class="w-full bg-surface border border-border rounded px-4 py-2 text-text-main outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-mono text-text-muted mb-2">Slug {selectedPostId() ? "(read-only)" : "(auto-generated)"}</label>
                                <input
                                    type="text"
                                    value={slug()}
                                    onInput={(e) => setSlug(e.currentTarget.value)}
                                    readOnly={!!selectedPostId()}
                                    class={`w - full bg - surface border border - border rounded px - 4 py - 2 text - text - main outline - none focus: border - accent transition - colors font - mono text - sm ${selectedPostId() ? "opacity-50 cursor-not-allowed" : ""} `}
                                    placeholder="tiling-interfaces"
                                />
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-mono text-text-muted mb-2">Preview</label>
                            <input
                                type="text"
                                value={preview()}
                                onInput={(e) => setPreview(e.currentTarget.value)}
                                class="w-full bg-surface border border-border rounded px-4 py-2 text-text-main outline-none focus:border-accent transition-colors"
                                placeholder="A short description of your post"
                            />
                        </div>
                    </div>

                    {/* Markdown Editor */}
                    <div class="flex-1 flex flex-col min-h-[400px]">
                        <label class="block text-sm font-mono text-text-muted mb-2">Content (Markdown) *</label>
                        <textarea
                            value={content()}
                            onInput={(e) => setContent(e.currentTarget.value)}
                            class="flex-1 w-full bg-surface border border-border rounded px-4 py-3 text-text-main outline-none focus:border-accent transition-colors resize-none font-mono leading-relaxed"
                            placeholder="# Your Post Title\n\nStart writing your markdown content here..."
                        />
                    </div>
                </div>
            }
        />
    );
};
