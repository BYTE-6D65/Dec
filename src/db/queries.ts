import { eq, desc, and } from "drizzle-orm";
import { db } from "./client";
import { users, linkedAccounts, blogPosts, notes, auditLogs } from "./schema";

// --- Users ---

export async function createUser(handle: string, role: "admin" | "user" = "user") {
    const [user] = await db.insert(users).values({ handle, role }).returning();
    return user;
}

export async function getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
}

export async function getUserByHandle(handle: string) {
    const [user] = await db.select().from(users).where(eq(users.handle, handle));
    return user;
}

// --- Auth (Linked Accounts) ---

export async function linkAccount(userId: string, provider: string, providerUserId: string, metadata: any = {}) {
    const [account] = await db.insert(linkedAccounts).values({
        userId,
        provider,
        providerUserId,
        metadataJson: JSON.stringify(metadata),
    }).returning();
    return account;
}

export async function getLinkedAccounts(userId: string) {
    return db.select().from(linkedAccounts).where(eq(linkedAccounts.userId, userId));
}

export async function getAccountByProvider(provider: string, providerUserId: string) {
    const [account] = await db.select().from(linkedAccounts).where(
        and(
            eq(linkedAccounts.provider, provider),
            eq(linkedAccounts.providerUserId, providerUserId)
        )
    );
    return account;
}

// --- Blog Posts ---

export async function createPost(authorUserId: string, title: string, slug: string, contentMarkdown: string, published: boolean = false) {
    const [post] = await db.insert(blogPosts).values({
        authorUserId,
        title,
        slug,
        contentMarkdown,
        published,
    }).returning();
    return post;
}

export async function updatePost(id: string, data: Partial<typeof blogPosts.$inferInsert>) {
    const [post] = await db.update(blogPosts)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(blogPosts.id, id))
        .returning();
    return post;
}

export async function getPostBySlug(slug: string) {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
}

export async function getAllPosts(includeDrafts: boolean = false) {
    if (includeDrafts) {
        return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    }
    return db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.createdAt));
}

// --- Notes ---

export async function createNote(title: string, contentMarkdown: string) {
    const [note] = await db.insert(notes).values({ title, contentMarkdown }).returning();
    return note;
}

export async function getAllNotes() {
    return db.select().from(notes).orderBy(desc(notes.updatedAt));
}

// --- Audit Logs ---

export async function logEvent(eventType: string, details: any = {}, userId?: string) {
    await db.insert(auditLogs).values({
        eventType,
        detailsJson: JSON.stringify(details),
        userId,
    });
}
