import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { attributionValidator } from "./applications";

export const record = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    callStart: v.string(),
    timeZone: v.string(),
    meetingLink: v.string(),
    setterName: v.optional(v.string()),
    closerName: v.optional(v.string()),
    submittedAt: v.number(),
    attribution: attributionValidator,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_email_start", (q) => q.eq("email", args.email).eq("callStart", args.callStart))
      .first();
    if (existing) {
      return {
        bookingId: existing._id,
        isDuplicate: true,
        syncStatus: existing.syncStatus,
        closeLeadId: existing.closeLeadId,
        closeOpportunityId: existing.closeOpportunityId,
        ghlContactId: existing.ghlContactId,
        ghlOpportunityId: existing.ghlOpportunityId,
      };
    }
    const application = await ctx.db
      .query("applications")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    const optIn = application?.closeLeadId
      ? null
      : await ctx.db.query("optIns").withIndex("by_email", (q) => q.eq("email", args.email)).first();
    const bookingId = await ctx.db.insert("bookings", { ...args, syncStatus: "pending" });
    return {
      bookingId,
      isDuplicate: false,
      syncStatus: "pending" as const,
      closeLeadId: application?.closeLeadId || optIn?.closeLeadId,
      closeOpportunityId: application?.closeOpportunityId,
      ghlContactId: application?.ghlContactId || optIn?.ghlContactId,
      ghlOpportunityId: application?.ghlOpportunityId,
    };
  },
});

export const markSync = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(v.literal("synced"), v.literal("failed")),
    closeLeadId: v.optional(v.string()),
    closeOpportunityId: v.optional(v.string()),
    closeActivityId: v.optional(v.string()),
    ghlContactId: v.optional(v.string()),
    ghlOpportunityId: v.optional(v.string()),
    ghlNoteId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { bookingId, status, error, ...ids } = args;
    await ctx.db.patch(bookingId, { ...ids, syncStatus: status, syncError: error });
  },
});
