import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { addPostComment, listFeedPosts, listPostComments, toggleCommentLike, togglePostLike } from "./db";
import { z } from "zod";

const clientIdSchema = z.string().trim().min(8).max(96);
const postIdSchema = z.number().int().positive();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  posts: router({
    list: publicProcedure
      .input(z.object({ clientId: clientIdSchema.optional() }))
      .query(({ input }) => listFeedPosts(input.clientId)),
    toggleLike: publicProcedure
      .input(z.object({ postId: postIdSchema, clientId: clientIdSchema }))
      .mutation(({ input }) => togglePostLike(input.postId, input.clientId)),
    comments: publicProcedure
      .input(z.object({ postId: postIdSchema, clientId: clientIdSchema.optional() }))
      .query(({ input }) => listPostComments(input.postId, input.clientId)),
    addComment: publicProcedure
      .input(
        z.object({
          postId: postIdSchema,
          parentId: postIdSchema.nullable().optional(),
          clientId: clientIdSchema,
          authorName: z.string().trim().min(1).max(120),
          body: z.string().trim().min(1).max(2000),
        }),
      )
      .mutation(({ input }) => addPostComment(input)),
    toggleCommentLike: publicProcedure
      .input(z.object({ commentId: postIdSchema, clientId: clientIdSchema }))
      .mutation(({ input }) => toggleCommentLike(input.commentId, input.clientId)),
  }),
});

export type AppRouter = typeof appRouter;
