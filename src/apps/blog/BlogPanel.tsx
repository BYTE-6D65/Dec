import { Component, For, createSignal, Show } from "solid-js";
import { ResizableSplitPane } from "~/components/ResizableSplitPane";
import { createAsync } from "@solidjs/router";
import { getBlogPosts } from "./blogLoader";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  preview: string;
  slug: string;
  content: string;
  htmlContent: string;
}

export const BlogPanel: Component = () => {
  const posts = createAsync(() => getBlogPosts());
  const [selectedPostId, setSelectedPostId] = createSignal<string | null>(null);

  const activePost = () => posts()?.find(p => p.id === selectedPostId());

  return (
    <ResizableSplitPane
      initialLeftWidth={350}
      minLeftWidth={250}
      maxLeftWidth={600}
      left={
        <div class="h-full w-full border-r border-border pl-0 pr-0 overflow-y-auto">
          <Show when={posts()} fallback={<div class="p-4 text-text-muted">Loading posts...</div>}>
            <div class="h-full w-full border-r border-border px-0 overflow-y-auto">
              <div class="px-2 py-4 space-y-2">
                <For each={posts()}>
                  {(post) => (
                    <article
                      onClick={() => setSelectedPostId(post.id)}
                      class={`p-2 rounded border transition - all cursor - pointer shadow - sm ${selectedPostId() === post.id
                        ? "bg-surface border-accent"
                        : "border-transparent hover:bg-surface hover:border-border"
                        } `}>
                      <h2 class={`font - bold mb - 1 ${selectedPostId() === post.id ? "text-accent" : "text-text-main"} `}>
                        {post.title}
                      </h2>
                      <span class="text-xs text-text-muted font-mono block mb-2">{post.date}</span>
                      <p class="text-xs text-text-faint leading-relaxed line-clamp-2">{post.preview}</p>
                    </article>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      }
      right={
        <div class="h-full w-full overflow-y-auto bg-surface rounded-lg p-8 shadow-md">
          <Show when={activePost()} fallback={
            <div class="h-full flex flex-col items-center justify-center text-text-muted">
              <span class="text-4xl mb-4">←</span>
              <p>Select a post to read</p>
            </div>
          }>
            {(post) => (
              <article class="prose prose-invert prose-headings:text-text-main prose-p:text-text-muted prose-strong:text-text-main prose-code:text-accent prose-a:text-accent max-w-none">
                <h1 class="text-3xl font-bold mb-2 text-text-main">{post().title}</h1>
                <div class="text-sm text-text-muted font-mono mb-8 border-b border-border pb-4">{post().date}</div>
                <div innerHTML={post().htmlContent} />
              </article>
            )}
          </Show>
        </div>
      }
    />
  );
};
