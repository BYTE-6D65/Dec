# Dec

> **A public-facing experimentation and showcase of DECK principles.**

Dec is a web-based tiling interface that explores embodied computing, context-aware workspaces, and sovereign digital presence—translated into browser space.

## What is DECK?

DECK is a philosophy and framework for **embodied computing**—systems that live with you, respect context, and maintain memory. It rejects surveillance-driven design patterns and the commodification of identity, instead prioritizing:

- **Identity sovereignty** – Your presence is yours, not a cached variable in someone else's server
- **Context awareness** – Systems adapt to signals like location, mode, and intent
- **Declarative intent** – Define what *should be*, not just what *is*
- **Workspace isolation** – Multiple states (work, travel, focus) as first-class primitives
- **The right to fail and rebuild** – Systems that respect you enough not to pretend perfection

DECK rethinks the filesystem hierarchy to be human-centered, with clean namespaces (`/deck`, `/pillar`) instead of legacy Unix sprawl. It emphasizes use over surveillance, locality over cloud dependency, and refusal over compliance.

## What is Dec?

Dec brings DECK principles to the web:

- **Tiling interface** – Multiple concurrent contexts (Blog, Terminal, Media, Edit) in persistent spatial layouts
- **Session-aware workspaces** – UI adapts based on authentication and role (public/user/admin)
- **Embodied navigation** – Sidebar as spatial memory, top bar as context switcher
- **Content sovereignty** – Public users can draft locally (localStorage), admins publish to the site
- **Theme as signal** – Light/dark modes as contextual markers, not just aesthetics

This is a **live experiment**, not a finished product. It showcases what interface design looks like when identity, context, and control are non-negotiable.

## Features

- **Blog** – Markdown-based posts with frontmatter
- **Terminal** – xterm.js integration (auth-gated)
- **Media** – Content-agnostic player (YouTube, Twitch, direct video)
- **Edit** – Dual-mode editor (localStorage for public, database for admin)
- **GitHub OAuth** – Optional authentication with role-based access
- **Theme system** – CSS variables for consistent, adaptable theming

## Tech Stack

- **Runtime:** [Bun](https://bun.sh) (fast JavaScript runtime)
- **Framework:** [SolidJS](https://solidjs.com) + [SolidStart](https://start.solidjs.com)
- **Auth:** [Auth.js](https://authjs.dev) with GitHub OAuth
- **Database:** SQLite via [Drizzle ORM](https://orm.drizzle.team)
- **Styling:** TailwindCSS with custom CSS variables
- **Terminal:** xterm.js
- **Markdown:** gray-matter + remark

## Getting Started

> **IMPORTANT:** This project uses **Bun**, not npm/yarn/pnpm.

### Prerequisites

- [Bun](https://bun.sh) installed
- (Optional) GitHub OAuth app for authentication

### Installation

```bash
# Clone the repository
git clone https://github.com/BYTE-6D65/Dec.git
cd Dec

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your OAuth credentials (optional)

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

The app will be available at `http://localhost:3000`.

### Building for Production

```bash
bun run build
bun start
```

## Environment Variables

See `.env.example` for required configuration:

- `AUTH_SECRET` – Random 32-char string for session encryption
- `GITHUB_ID` / `GITHUB_SECRET` – GitHub OAuth credentials
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – (Optional) Google OAuth
- `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` – (Optional) Twitch OAuth

## Usage

### Public Access
- Browse blog posts
- Draft posts in Edit panel (saved to browser localStorage)
- View media with direct URLs

### Authenticated Access
- Access terminal
- Full UI features

### Admin Access
- Publish blog posts to production
- Full site control

## Project Structure

```
/src
  /apps          # Panel-specific logic (blog, media, edit, terminal)
  /components    # Shared UI components
  /db            # Database schema and queries
  /lib           # Auth utilities and helpers
  /routes        # SolidStart file-based routing
    /api         # API endpoints (auth, blog, media)
  /themes.css    # Theme color definitions
```

## Philosophy

This project is an experiment in **tiling-esque UI principles** applied to the web. It asks:

- What if web apps respected your context?
- What if navigation was spatial, not hierarchical?
- What if identity wasn't a form field, but a signal?
- What if privacy was a default, not an upgrade?

DECK is the filesystem. Dec is the interface. Both are attempts to answer:

> What does computing look like when the system works for you, not on you?

## License

MIT – See [LICENSE](LICENSE)

## Links

- [DECK Lore](https://github.com/BYTE-6D65) (coming soon)
- [SolidJS Documentation](https://solidjs.com)
- [Auth.js Documentation](https://authjs.dev)

---

*"Everything is false until it proves useful."*
~ Zephyr
