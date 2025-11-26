import { Component, Show, createSignal, onMount } from "solid-js";
import { useConfig } from "~/state/configStore";
import { panelState } from "~/state/panelState";
import type { Theme } from "~/state/configStore";

export const SettingsPanel: Component = () => {
    const { config, updateVisitor } = useConfig();
    const [session, setSession] = createSignal<any>(null);
    const [saving, setSaving] = createSignal(false);
    const [showResetConfirm, setShowResetConfirm] = createSignal(false);

    onMount(async () => {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
            const data = await response.json();
            setSession(data);
        }
    });

    const themes: { value: Theme; label: string; color: string }[] = [
        { value: 'cyan', label: 'Cyan', color: '#06b6d4' },
        { value: 'purple', label: 'Purple', color: '#a855f7' },
        { value: 'orange', label: 'Orange', color: '#f97316' },
        { value: 'white', label: 'Light', color: '#ffffff' },
        { value: 'dark', label: 'Dark', color: '#1f2937' },
        { value: 'system', label: 'System', color: '#6b7280' },
    ];

    const handleThemeChange = (theme: Theme) => {
        updateVisitor(prev => ({ ...prev, theme }));
    };

    const handleSidebarToggle = () => {
        const newPosition = panelState.sidebarPosition() === 'left' ? 'right' : 'left';
        panelState.setSidebarPosition(newPosition);
    };

    const handleReset = async () => {
        setSaving(true);

        // Reset to defaults
        updateVisitor(prev => ({ ...prev, theme: 'system' }));
        panelState.setSidebarPosition('left');
        panelState.setActivePanel('about');

        // Clear localStorage
        if (typeof window !== "undefined") {
            localStorage.removeItem("dec_panel_state_v1");
            localStorage.removeItem("dec_visitor_config_v1");
        }

        // Reset in database if signed in
        if (session()?.user) {
            await fetch('/api/user/reset-preferences', { method: 'POST' });
        }

        setSaving(false);
        setShowResetConfirm(false);
    };

    return (
        <div class="p-8 max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold mb-8 text-text-main">Settings</h1>

            {/* Account Section */}
            <Show when={session()?.user}>
                <section class="mb-8 p-6 bg-surface rounded-lg border border-border">
                    <h2 class="text-xl font-semibold mb-4 text-text-main">Account</h2>
                    <div class="space-y-3">
                        <div class="flex items-center gap-4">
                            <Show when={session()?.user?.image}>
                                <img
                                    src={session()!.user!.image!}
                                    alt="Profile"
                                    class="w-16 h-16 rounded-full border-2 border-accent"
                                />
                            </Show>
                            <div>
                                <p class="text-lg font-medium text-text-main">{session()?.user?.name}</p>
                                <p class="text-sm text-text-muted capitalize">{session()?.user?.role}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </Show>

            {/* Preferences Section */}
            <section class="mb-8 p-6 bg-surface rounded-lg border border-border">
                <h2 class="text-xl font-semibold mb-4 text-text-main">Preferences</h2>

                {/* Theme Selector */}
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-3 text-text-main">Theme</label>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {themes.map(theme => (
                            <button
                                onClick={() => handleThemeChange(theme.value)}
                                class={`p-4 rounded-lg border-2 transition-all ${config().theme === theme.value
                                        ? 'border-accent bg-active'
                                        : 'border-border hover:border-accent/50'
                                    }`}
                            >
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-6 h-6 rounded-full border border-border"
                                        style={{ "background-color": theme.color }}
                                    />
                                    <span class="font-medium text-text-main">{theme.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar Position */}
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-3 text-text-main">Sidebar Position</label>
                    <div class="flex gap-3">
                        <button
                            onClick={handleSidebarToggle}
                            class={`flex-1 p-4 rounded-lg border-2 transition-all ${panelState.sidebarPosition() === 'left'
                                    ? 'border-accent bg-active'
                                    : 'border-border hover:border-accent/50'
                                }`}
                        >
                            <span class="font-medium text-text-main">Left</span>
                        </button>
                        <button
                            onClick={handleSidebarToggle}
                            class={`flex-1 p-4 rounded-lg border-2 transition-all ${panelState.sidebarPosition() === 'right'
                                    ? 'border-accent bg-active'
                                    : 'border-border hover:border-accent/50'
                                }`}
                        >
                            <span class="font-medium text-text-main">Right</span>
                        </button>
                    </div>
                </div>

                {/* Current Panel */}
                <div>
                    <label class="block text-sm font-medium mb-2 text-text-main">Active Panel</label>
                    <p class="text-text-muted capitalize">{panelState.activePanel() || 'None'}</p>
                </div>
            </section>

            {/* Actions Section */}
            <section class="mb-8 p-6 bg-surface rounded-lg border border-border">
                <h2 class="text-xl font-semibold mb-4 text-text-main">Actions</h2>

                <Show when={!showResetConfirm()}>
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        class="px-6 py-3 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-medium"
                    >
                        Reset to Defaults
                    </button>
                </Show>

                <Show when={showResetConfirm()}>
                    <div class="p-4 bg-red-500/10 border border-red-500 rounded-lg">
                        <p class="mb-4 text-text-main">Are you sure? This will reset all preferences to defaults.</p>
                        <div class="flex gap-3">
                            <button
                                onClick={handleReset}
                                disabled={saving()}
                                class="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                            >
                                {saving() ? 'Resetting...' : 'Yes, Reset'}
                            </button>
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                class="px-6 py-2 rounded-lg border border-border hover:bg-surface transition-colors font-medium text-text-main"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Show>
            </section>

            {/* Integrations Section */}
            <Show when={session()?.user}>
                <section class="p-6 bg-surface rounded-lg border border-border">
                    <h2 class="text-xl font-semibold mb-4 text-text-main">Integrations</h2>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                            <div class="flex items-center gap-3">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                <div>
                                    <p class="font-medium text-text-main">GitHub</p>
                                    <p class="text-sm text-text-muted">Connected</p>
                                </div>
                            </div>
                            <span class="text-green-500 font-medium">✓</span>
                        </div>
                        <p class="text-sm text-text-muted italic">More integrations coming soon...</p>
                    </div>
                </section>
            </Show>
        </div>
    );
};
