import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const attributionValidator = v.object({
  source: v.optional(v.string()),
  medium: v.optional(v.string()),
  campaign: v.optional(v.string()),
  content: v.optional(v.string()),
});

export const record = internalMutation({
  args: {
    currentWork: v.string(),
    currentIncome: v.string(),
    incomeGoal: v.string(),
    experience: v.string(),
    urgency: v.string(),
    name: v.string(),
    email: v.string(),
    instagram: v.string(),
    phone: v.string(),
    liquidCapital: v.string(),
    nonMarketingConsent: v.boolean(),
    marketingConsent: v.boolean(),
    qualificationStatus: v.union(v.literal("qualified"), v.literal("unqualified")),
    submittedAt: v.number(),
    landingPage: v.string(),
    userAgent: v.optional(v.string()),
    attribution: attributionValidator,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return {
        applicationId: existing._id,
        isDuplicate: true,
        syncStatus: existing.syncStatus,
        closeLeadId: existing.closeLeadId,
        closeOpportunityId: existing.closeOpportunityId,
      };
    }

    const optIn = await ctx.db
      .query("optIns")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    const applicationId = await ctx.db.insert("applications", {
      ...args,
      syncStatus: "pending",
    });
    return {
      applicationId,
      isDuplicate: false,
      syncStatus: "pending" as const,
      closeLeadId: optIn?.closeLeadId,
    };
  },
});

export const markSync = internalMutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(v.literal("synced"), v.literal("failed")),
    closeLeadId: v.optional(v.string()),
    closeOpportunityId: v.optional(v.string()),
    closeActivityId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { applicationId, status, error, ...ids } = args;
    await ctx.db.patch(applicationId, {
      ...ids,
      syncStatus: status,
      syncError: error,
    });
  },
});
