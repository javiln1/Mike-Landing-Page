import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { attributionValidator, DEDUPE_BY_EMAIL } from "./applications";

export const record = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    submittedAt: v.number(),
    landingPage: v.string(),
    userAgent: v.optional(v.string()),
    attribution: attributionValidator,
  },
  handler: async (ctx, args) => {
    const existing = DEDUPE_BY_EMAIL
      ? await ctx.db
        .query("optIns")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first()
      : null;
    if (existing) {
      return {
        optInId: existing._id,
        isDuplicate: true,
        syncStatus: existing.syncStatus,
        closeLeadId: existing.closeLeadId,
        ghlContactId: existing.ghlContactId,
      };
    }
    const optInId = await ctx.db.insert("optIns", { ...args, syncStatus: "pending" });
    return { optInId, isDuplicate: false, syncStatus: "pending" as const };
  },
});

export const markSync = internalMutation({
  args: {
    optInId: v.id("optIns"),
    status: v.union(v.literal("synced"), v.literal("failed")),
    closeLeadId: v.optional(v.string()),
    closeActivityId: v.optional(v.string()),
    ghlContactId: v.optional(v.string()),
    ghlNoteId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { optInId, status, error, ...ids } = args;
    await ctx.db.patch(optInId, { ...ids, syncStatus: status, syncError: error });
  },
});
