import { createUser, createPost, updatePost, getAllPosts, logEvent, getUserById, getUserByHandle } from "../src/db/queries";

console.log("Starting DB Verification...");

try {
    // 1. Create User (or get existing)
    console.log("Creating/Fetching user...");
    let user = await getUserById("test-user-id");
    if (!user) {
        try {
            user = await createUser("testuser", "user");
        } catch (e) {
            // If create failed (e.g. handle exists but ID different?), try to get by handle
            const existing = await import("../src/db/queries").then(m => m.getUserByHandle("testuser"));
            if (existing) user = existing;
            else throw e;
        }
    }
    console.log("User:", user);

    // 2. Create Post
    console.log("Creating blog post...");
    const post = await createPost(user.id, "Test Post", "test-post", "# Hello World", true);
    console.log("Created post:", post);

    console.log("Updating blog post...");
    const updatedPost = await updatePost(post.id, { title: "Updated Test Post", contentMarkdown: "# Hello Updated World" });
    console.log("Updated post:", updatedPost);

    console.log("Fetching all posts...");
    const posts = await getAllPosts(true);
    console.log("All posts:", posts.length);
    const fetchedPost = posts.find(p => p.id === post.id);
    if (fetchedPost?.title !== "Updated Test Post") {
        throw new Error("Post update failed verification");
    }
    console.log("Verified updated post in list.");
    if (posts.length === 0) throw new Error("No posts found!");

    // 4. Log Event
    console.log("Logging event...");
    await logEvent("TEST_EVENT", { foo: "bar" }, user.id);
    console.log("Event logged.");

    console.log("✅ DB Verification Successful!");
} catch (error) {
    console.error("❌ DB Verification Failed:", error);
    process.exit(1);
}
