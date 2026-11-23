import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const posts = mysqlTable(
  "posts",
  {
    id: int("id").autoincrement().primaryKey(),
    externalId: varchar("externalId", { length: 80 }).notNull(),
    creatorName: varchar("creatorName", { length: 120 }).notNull(),
    handle: varchar("handle", { length: 80 }).notNull(),
    caption: text("caption").notNull(),
    tags: varchar("tags", { length: 255 }).notNull(),
    accent: varchar("accent", { length: 24 }).notNull().default("violet"),
    posterUrl: text("posterUrl"),
    videoUrl: text("videoUrl").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    externalIdUnique: uniqueIndex("posts_externalId_unique").on(table.externalId),
  }),
);

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export const postLikes = mysqlTable(
  "post_likes",
  {
    id: int("id").autoincrement().primaryKey(),
    postId: int("postId").notNull(),
    clientId: varchar("clientId", { length: 96 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    postClientUnique: uniqueIndex("post_likes_post_client_unique").on(table.postId, table.clientId),
    postIndex: index("post_likes_post_idx").on(table.postId),
  }),
);

export type PostLike = typeof postLikes.$inferSelect;

export const comments = mysqlTable(
  "comments",
  {
    id: int("id").autoincrement().primaryKey(),
    postId: int("postId").notNull(),
    parentId: int("parentId"),
    clientId: varchar("clientId", { length: 96 }).notNull(),
    authorName: varchar("authorName", { length: 120 }).notNull().default("Sasha Volkova"),
    body: text("body").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    postIndex: index("comments_post_idx").on(table.postId),
    parentIndex: index("comments_parent_idx").on(table.parentId),
  }),
);

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

export const commentLikes = mysqlTable(
  "comment_likes",
  {
    id: int("id").autoincrement().primaryKey(),
    commentId: int("commentId").notNull(),
    clientId: varchar("clientId", { length: 96 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    commentClientUnique: uniqueIndex("comment_likes_comment_client_unique").on(table.commentId, table.clientId),
    commentIndex: index("comment_likes_comment_idx").on(table.commentId),
  }),
);

export type CommentLike = typeof commentLikes.$inferSelect;
