import { Component } from "solid-js";

export const AboutPanel: Component = () => {
    return (
        <div class="space-y-6">
            <h1 class="text-4xl font-bold text-accent">Hello, I'm Byte.</h1>
            <p class="text-xl text-text-main leading-relaxed">
                I'm a software engineer and designer based in Ohio.
                I specialize in building system applications and experimental web applications with a focus on
                clean aesthetics and intuitive interfaces.
            </p>
            <p class="text-lg text-text-muted leading-relaxed">
                This website is an experiment in non-traditional web layouts,
                inspired by tiling window managers and desktop environments.
            </p>

            <div class="mt-8 p-4 border border-border rounded bg-surface-highlight">
                <h3 class="text-sm font-bold uppercase tracking-wider mb-2 text-text-faint">Current Focus</h3>
                <ul class="list-disc list-inside text-text-muted space-y-1">
                    <li>Advanced Agentic Coding</li>
                    <li>SolidJS Ecosystem</li>
                    <li>Generative UI Design</li>
                </ul>
            </div>
        </div>
    );
};
