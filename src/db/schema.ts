import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Users Table
export const users = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    handle: text("handle").notNull().unique(),
    role: text("role", { enum: ["admin", "user"] }).default("user").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    settingsJson: text("settings_json"), // JSON string
});

// Linked Accounts Table (OAuth)
export const linkedAccounts = sqliteTable("linked_accounts", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id).notNull(),
    provider: text("provider").notNull(), // 'github', etc.
    providerUserId: text("provider_user_id").notNull(),
    accessTokenEncrypted: text("access_token_encrypted"),
    refreshTokenEncrypted: text("refresh_token_encrypted"),
    metadataJson: text("metadata_json"), // JSON string
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

// Blog Posts Table
export const blogPosts = sqliteTable("blog_posts", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    contentMarkdown: text("content_markdown").notNull(),
    published: integer("published", { mode: "boolean" }).default(false).notNull(),
    authorUserId: text("author_user_id").references(() => users.id).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

// Notes Table (Admin only)
export const notes = sqliteTable("notes", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    contentMarkdown: text("content_markdown").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

// Audit Logs Table
export const auditLogs = sqliteTable("audit_logs", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    timestamp: integer("timestamp", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    userId: text("user_id").references(() => users.id), // Nullable for anonymous events
    eventType: text("event_type").notNull(),
    detailsJson: text("details_json"), // JSON string
});
