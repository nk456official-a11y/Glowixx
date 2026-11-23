import { and, asc, count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  comments,
  InsertComment,
  InsertPost,
  InsertUser,
  postLikes,
  posts,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

const seedPosts: InsertPost[] = [
  {
    externalId: "seed-mila-chen",
    creatorName: "Mila Chen",
    handle: "@milachen",
    caption: "late light, soft focus, no plans ✦",
    tags: "#slowdays  #goldenhour",
    accent: "sunset",
    posterUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-under-neon-lights-12339-large.mp4",
  },
  {
    externalId: "seed-noah-park",
    creatorName: "Noah Park",
    handle: "@noahpark",
    caption: "Found a little bit of magic on my walk home.",
    tags: "#cityglow  #afterhours",
    accent: "blue",
    posterUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-11-large.mp4",
  },
  {
    externalId: "seed-lena-ortiz",
    creatorName: "Lena Ortiz",
    handle: "@lena.o",
    caption: "A tiny reset between two very big days.",
    tags: "#rituals  #morningclub",
    accent: "mint",
    posterUrl: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=85",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-in-a-studio-39803-large.mp4",
  },
];

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _db = drizzle(ENV.databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

async function ensureSeedPosts(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  for (const post of seedPosts) {
    await db.insert(posts).values(post).onDuplicateKeyUpdate({
      set: { externalId: post.externalId },
    });
  }
}

export type FeedPost = {
  id: number;
  externalId: string;
  user: string;
  handle: string;
  caption: string;
  tags: string;
  accent: string;
  poster: string | null;
  src: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: Date;
};

export async function listFeedPosts(clientId?: string): Promise<FeedPost[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  await ensureSeedPosts(db);
  const rows = await db.select().from(posts).orderBy(desc(posts.createdAt));
  const likedRows = clientId
    ? await db.select({ postId: postLikes.postId }).from(postLikes).where(eq(postLikes.clientId, clientId))
    : [];
  const likedIds = new Set(likedRows.map(row => row.postId));

  return Promise.all(
    rows.map(async post => {
      const [{ value: likeCount }] = await db
        .select({ value: count() })
        .from(postLikes)
        .where(eq(postLikes.postId, post.id));
      const [{ value: commentCount }] = await db
        .select({ value: count() })
        .from(comments)
        .where(eq(comments.postId, post.id));

      return {
        id: post.id,
        externalId: post.externalId,
        user: post.creatorName,
        handle: post.handle,
        caption: post.caption,
        tags: post.tags,
        accent: post.accent,
        poster: post.posterUrl,
        src: post.videoUrl,
        likes: Number(likeCount ?? 0),
        comments: Number(commentCount ?? 0),
        isLiked: likedIds.has(post.id),
        createdAt: post.createdAt,
      };
    }),
  );
}

export async function togglePostLike(postId: number, clientId: string): Promise<{ liked: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const existing = await db
    .select({ id: postLikes.id })
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.clientId, clientId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
    return { liked: false };
  }

  await db.insert(postLikes).values({ postId, clientId });
  return { liked: true };
}

export async function listPostComments(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  return db
    .select({
      id: comments.id,
      postId: comments.postId,
      clientId: comments.clientId,
      authorName: comments.authorName,
      body: comments.body,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));
}

export async function addPostComment(input: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const result = await db.insert(comments).values(input);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(comments).where(eq(comments.id, insertedId)).limit(1);
  return inserted[0];
}

export async function createUploadedPost(input: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  await db.insert(posts).values(input);
  const inserted = await db.select().from(posts).where(eq(posts.externalId, input.externalId)).limit(1);
  return inserted[0];
}
