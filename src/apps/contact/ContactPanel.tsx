import { Component } from "solid-js";

export const ContactPanel: Component = () => {
    return (
        <div class="max-w-xl mx-auto">
            <h2 class="text-2xl font-bold mb-6 text-center">Get in Touch</h2>
            <form class="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label class="block text-sm font-bold text-text-muted mb-1">Name</label>
                    <input
                        type="text"
                        class="w-full bg-surface border border-transparent focus:border-accent rounded p-3 text-text-main outline-none transition-colors"
                        placeholder="Your Name"
                    />
                </div>
                <div>
                    <label class="block text-sm font-bold text-text-muted mb-1">Email</label>
                    <input
                        type="email"
                        class="w-full bg-surface border border-transparent focus:border-accent rounded p-3 text-text-main outline-none transition-colors"
                        placeholder="your@email.com"
                    />
                </div>
                <div>
                    <label class="block text-sm font-bold text-text-muted mb-1">Message</label>
                    <textarea
                        class="w-full bg-surface border border-transparent focus:border-accent rounded p-3 text-text-main outline-none transition-colors h-32 resize-none"
                        placeholder="Say hello..."
                    ></textarea>
                </div>
                <button class="w-full bg-accent text-background font-bold py-3 rounded hover:bg-text-main transition-colors">
                    Send Message
                </button>
            </form>

            <div class="mt-12 flex justify-center gap-8 text-text-muted">
                <a href="#" class="hover:text-text-main transition-colors">Twitter</a>
                <a href="#" class="hover:text-text-main transition-colors">GitHub</a>
                <a href="#" class="hover:text-text-main transition-colors">LinkedIn</a>
            </div>
        </div>
    );
};
