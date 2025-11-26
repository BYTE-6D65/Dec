import { type APIEvent } from "@solidjs/start/server";
import { json } from "@solidjs/router";
import { getSession } from "@auth/solid-start";
import { authOpts } from "~/lib/auth.server";
import { db } from "~/db/client";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";

// POST /api/user/reset-preferences - Reset user preferences to defaults
export async function POST(event: APIEvent) {
    const session = await getSession(event.request, authOpts);

    if (!session?.user?.id) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        // Reset preferences to empty object (defaults)
        await db
            .update(users)
            .set({ settingsJson: JSON.stringify({}) })
            .where(eq(users.id, userId));

        return json({ success: true });
    } catch (error) {
        console.error("Error resetting preferences:", error);
        return json({ error: "Failed to reset preferences" }, { status: 500 });
    }
}
