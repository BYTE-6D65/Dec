import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "../src/db/client";

console.log("Running migrations...");
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations complete!");
