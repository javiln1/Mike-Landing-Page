import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const outcomeValidator = v.union(
  v.literal("Deal Won"),
  v.literal("Follow Up"),
  v.literal("Deal Lost"),
  v.literal("No Show"),
  v.literal("Rescheduled"),
  v.literal("Disqualified"),
  v.literal("Not Contacted"),
);

const optionalString = v.optional(v.string());

export const record = internalMutation({
  args: {
    submissionKey: v.string(),
    name: v.string(),
    email: v.string(),
    setterName: optionalString,
    closerName: optionalString,
    outcome: outcomeValidator,
    callDate: optionalString,
    investmentCapability: optionalString,
    currentSituation: optionalString,
    desiredSituation: optionalString,
    obstacles: optionalString,
    followUpDate: optionalString,
    followUpReason: optionalString,
    deposit: optionalString,
    dateWon: optionalString,
    cashCollected: optionalString,
    packageTotal: optionalString,
    financingType: optionalString,
    paymentPlanMonths: optionalString,
    paymentPerPeriod: optionalString,
    dateLost: optionalString,
    lossReason: optionalString,
    notes: optionalString,
    submittedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("outcomes")
      .withIndex("by_submission_key", (q) => q.eq("submissionKey", args.submissionKey))
      .first();
    if (existing) {
      return {
        outcomeId: existing._id,
        isDuplicate: true,
        syncStatus: existing.syncStatus,
        closeLeadId: existing.closeLeadId,
        closeOpportunityId: existing.closeOpportunityId,
      };
    }
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_submission")
      .order("desc")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    const outcomeId = await ctx.db.insert("outcomes", {
      ...args,
      closeLeadId: booking?.closeLeadId,
      closeOpportunityId: booking?.closeOpportunityId,
      syncStatus: "pending",
    });
    return {
      outcomeId,
      isDuplicate: false,
      syncStatus: "pending" as const,
      closeLeadId: booking?.closeLeadId,
      closeOpportunityId: booking?.closeOpportunityId,
    };
  },
});

export const markCloseSync = internalMutation({
  args: {
    outcomeId: v.id("outcomes"),
    status: v.union(v.literal("synced"), v.literal("failed")),
    closeLeadId: optionalString,
    closeOpportunityId: optionalString,
    error: optionalString,
  },
  handler: async (ctx, args) => {
    const { outcomeId, status, error, ...ids } = args;
    await ctx.db.patch(outcomeId, { ...ids, syncStatus: status, syncError: error });
  },
});
