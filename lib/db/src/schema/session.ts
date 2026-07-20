import { pgTable, varchar, json, timestamp, index } from "drizzle-orm/pg-core";

// Matches connect-pg-simple's expected shape exactly (sid/sess/expire) —
// https://github.com/voxpelli/node-connect-pg-simple/blob/main/table.sql
// Managed here (Drizzle push) instead of the library's own runtime
// createTableIfMissing, which reads a bundled table.sql via a relative path
// that breaks once the API server is compiled into a single esbuild bundle.
export const sessionTable = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
}, (table) => [
  index("IDX_user_sessions_expire").on(table.expire),
]);
