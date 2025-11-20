import { Component } from "solid-js";

export const AboutPanel: Component = () => {
    return (
        <div class="space-y-6">
            <h1 class="text-4xl font-bold text-accent">Hello, I'm Byte.</h1>
            <p class="text-lg text-text-main leading-relaxed">
                I build systems. Small, elegant ones that cooperate, and larger experimental ones that stretch what personal computing can be. My work focuses on event-driven architectures, agentic software, and user interfaces that treat text as something worthy of respect.
            </p>
            <p class="text-lg text-text-main leading-relaxed">
                Most of what I design lives under the DEC ecosystem: a long-term exploration of identity, memory, truth, and the strange little lies machines tell themselves to stay coherent. I enjoy peeling those layers apart and rebuilding them into something a bit more honest.
            </p>
            <p class="text-lg text-text-main leading-relaxed">
                I’m based in Ohio, where I spend my time building pipelines, designing interfaces, and occasionally wondering why my code compiles better when there’s a cat sitting on my keyboard.
            </p>
            <p class="text-lg text-text-muted leading-relaxed">
                (The world may never know. Meow.)
            </p>
            <p class="text-lg text-text-main leading-relaxed">
                This website is part lab notebook, part workspace, part experiment in non-traditional layouts inspired by tiling window managers. If something feels a bit weird here, that’s intentional. I like interfaces that reward exploration instead of hiding everything behind animations and corporate UX rituals.
            </p>

            <div class="mt-8 p-4 border border-border rounded bg-surface-highlight">
                <h3 class="text-sm font-bold uppercase tracking-wider mb-2 text-text-faint">Current Focus</h3>
                <ul class="list-disc list-inside text-text-muted space-y-1">
                    <li>Agentic Systems & Synthesis</li>
                    <ul>
                        <li>Building tools that think cooperatively instead of monolithically.</li>
                    </ul>
                    <li>SolidJS & High-Performance UI</li>
                    <ul>
                        <li>Interfaces that feel immediate, minimal, and predictable.</li>
                    </ul>
                    <li>Identity-Centric Computing (DEC)</li>
                    <ul>
                        <li>Rethinking how systems store context, hold memory, and decide what’s “true.”</li>
                    </ul>
                </ul>
            </div>
        </div>
    );
};
