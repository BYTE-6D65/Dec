import { type APIEvent } from "@solidjs/start/server";
import { json } from "@solidjs/router";
import { getSession } from "@auth/solid-start";
import { authOpts } from "~/lib/auth.server";
import { db } from "~/db/client";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";

interface UserPreferences {
    theme?: 'cyan' | 'purple' | 'orange' | 'white' | 'dark' | 'system';
    sidebarPosition?: 'left' | 'right';
    activePanel?: string | null;
}

// GET /api/user/preferences - Load user preferences
export async function GET(event: APIEvent) {
    const session = await getSession(event.request, authOpts);

    if (!session?.user?.id) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user || user.length === 0) {
            return json({ error: "User not found" }, { status: 404 });
        }

        const settingsJson = user[0].settingsJson;
        const preferences: UserPreferences = settingsJson
            ? JSON.parse(settingsJson)
            : {};

        return json({ preferences });
    } catch (error) {
        console.error("Error loading preferences:", error);
        return json({ error: "Failed to load preferences" }, { status: 500 });
    }
}

// POST /api/user/preferences - Save user preferences
export async function POST(event: APIEvent) {
    const session = await getSession(event.request, authOpts);

    if (!session?.user?.id) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await new Response(event.request.body).json();
    const preferences: UserPreferences = body.preferences;

    try {
        await db
            .update(users)
            .set({ settingsJson: JSON.stringify(preferences) })
            .where(eq(users.id, userId));

        return json({ success: true });
    } catch (error) {
        console.error("Error saving preferences:", error);
        return json({ error: "Failed to save preferences" }, { status: 500 });
    }
}
