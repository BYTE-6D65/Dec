import { PanelContainer } from "~/components/PanelContainer";
import { Suspense } from "solid-js";
import { AboutPanel } from "~/apps/about/AboutPanel";
import { ProjectsPanel } from "~/apps/projects/ProjectsPanel";
import { BlogPanel } from "~/apps/blog/BlogPanel";
import { MediaPanel } from "~/apps/media/MediaPanel";
import { ContactPanel } from "~/apps/contact/ContactPanel";
import { EditPanel } from "~/apps/edit/EditPanel";
import { ExcalidrawPanel } from "~/apps/excalidraw/ExcalidrawPanel";
import { SettingsPanel } from "~/apps/settings/SettingsPanel";
import { clientOnly } from "@solidjs/start";

const TerminalContainer = clientOnly(() => import("~/components/TerminalContainer").then(m => ({ default: m.TerminalContainer })));

import { onMount } from "solid-js";
import { panelState } from "~/state/panelState";
import { initConfig } from "~/state/configStore";

export default function Home() {
  onMount(() => {
    panelState.init();
    initConfig();
  });

  return (
    <div class="flex flex-col h-full">
      <PanelContainer id="about" title="About">
        <AboutPanel />
      </PanelContainer>
      <PanelContainer id="projects" title="Projects">
        <ProjectsPanel />
      </PanelContainer>
      <PanelContainer id="blog" title="Blog" noPadding>
        <Suspense fallback={<div class="p-8">Loading Blog...</div>}>
          <BlogPanel />
        </Suspense>
      </PanelContainer>
      <PanelContainer id="edit" title="Edit" noPadding>
        <Suspense fallback={<div class="p-8">Loading Editor...</div>}>
          <EditPanel />
        </Suspense>
      </PanelContainer>
      <PanelContainer id="excalidraw" title="Excalidraw" noPadding>
        <ExcalidrawPanel />
      </PanelContainer>
      <PanelContainer id="media" title="Media">
        <MediaPanel />
      </PanelContainer>
      <PanelContainer id="contact" title="Contact">
        <ContactPanel />
      </PanelContainer>
      <PanelContainer id="settings" title="Settings">
        <SettingsPanel />
      </PanelContainer>
      <PanelContainer id="terminal" title="Terminal" noPadding>
        <TerminalContainer />
      </PanelContainer>
    </div>
  );
}
