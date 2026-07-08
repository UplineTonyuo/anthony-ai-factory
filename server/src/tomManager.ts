import {
  requestTomAssignment,
  requestTomCampaignPlan,
  type RecentWorkItem,
  type TomAssignment,
} from "./groq.js";
import { listDrafts, type DraftItem } from "./draftStore.js";
import { executePersonalBrandAssignment, type ExecutionOptions } from "./personalBrandWorker.js";
import {
  createCampaign,
  findByIdempotencyKey,
  saveCampaign,
  type CampaignItemResult,
  type CampaignRecord,
} from "./campaignStore.js";

/**
 * Tom — the AI Manager seam.
 *
 * Tom inspects bounded recent queue work, decides one next assignment,
 * and delegates it to the specialist. He never writes final content,
 * never publishes, and never mutates the destination selection.
 * Scheduling is deliberately outside Tom's contract.
 */

const RECENT_WORK_LIMIT = 10;
const FALLBACK_THEME_MAX_LENGTH = 120;

/** Safe fields only: content type + theme (or a bounded hook-line fallback). */
function recentWorkContext(): RecentWorkItem[] {
  return [...listDrafts()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RECENT_WORK_LIMIT)
    .map((draft) => ({
      contentType: draft.contentType,
      theme: draft.sourceTheme?.trim()
        ? draft.sourceTheme.trim()
        : (draft.caption.split("\n")[0] ?? "").slice(0, FALLBACK_THEME_MAX_LENGTH),
    }));
}

export async function runTomDelegation(
  options: ExecutionOptions,
): Promise<{ assignment: TomAssignment; draft: DraftItem }> {
  const assignment = await requestTomAssignment(recentWorkContext());
  const draft = await executePersonalBrandAssignment(assignment, options);
  return { assignment, draft };
}

/* ============================================================
 * TOM — WEEKLY CAMPAIGN DELEGATION (Milestone 8A)
 * ============================================================ */

export interface CampaignExecutionOptions {
  /** Bound server-side from the persisted active selection; never client-supplied. */
  destinationExternalConnectionId: string;
  timezone: string;
}

const CAMPAIGN_SCHEDULE_HOUR = 10; // fixed local hour for all campaign items
// Manila has no daylight saving time, so a fixed +08:00 offset is correct
// for the only timezone this milestone supports scheduling display for.
const MANILA_UTC_OFFSET = "+08:00";

/**
 * Deterministic, non-AI scheduling: spreads `count` items across the next 7
 * days at distinct timestamps, all at a fixed local hour. This lives here,
 * not in Tom's Groq contract, so a future scheduling policy/agent can
 * replace it without touching planning or execution.
 */
function computeCampaignSchedule(count: number, timezone: string): string[] {
  const offset = timezone === "Asia/Manila" ? MANILA_UTC_OFFSET : "+00:00";
  const now = new Date();
  const schedule: string[] = [];
  for (let sequence = 1; sequence <= count; sequence++) {
    const dayOffset = Math.round((sequence * 7) / (count + 1));
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() + dayOffset);
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const hh = String(CAMPAIGN_SCHEDULE_HOUR).padStart(2, "0");
    schedule.push(`${yyyy}-${mm}-${dd}T${hh}:00:00${offset}`);
  }
  return schedule;
}

/** Executes campaign items in sequence order; stops at the first failure. */
async function executeCampaignItems(
  record: CampaignRecord,
  options: CampaignExecutionOptions,
): Promise<CampaignRecord> {
  let current = record;
  const items = [...current.items].sort((a, b) => a.sequence - b.sequence);

  for (const item of items) {
    if (item.status === "success") continue; // resume: skip already-completed work

    const assignment: TomAssignment = {
      assignedAgent: item.assignedAgent,
      goal: item.goal,
      contentType: item.contentType,
      sourceTheme: item.sourceTheme,
      rationale: item.rationale,
    };

    try {
      const draft = await executePersonalBrandAssignment(assignment, {
        destinationExternalConnectionId: options.destinationExternalConnectionId,
        scheduledAt: item.scheduledAt,
        timezone: item.timezone,
      });
      item.status = "success";
      item.draftId = draft.id;
      delete item.error;
    } catch (e) {
      item.status = "failed";
      item.error = (e instanceof Error ? e.message : String(e)).slice(0, 300);
      current = saveCampaign({ ...current, items });
      // Stop at first failure — do not multiply Groq usage on a likely
      // systemic error, and leave remaining items "pending" for resume.
      return saveCampaign({ ...current, status: "failed", items });
    }

    current = saveCampaign({ ...current, items });
  }

  const allSucceeded = items.every((item) => item.status === "success");
  return saveCampaign({ ...current, status: allSucceeded ? "completed" : "failed", items });
}

export async function runTomCampaign(
  objective: string,
  count: number,
  idempotencyKey: string | undefined,
  options: CampaignExecutionOptions,
): Promise<CampaignRecord> {
  if (idempotencyKey) {
    const existing = findByIdempotencyKey(idempotencyKey);
    if (existing) {
      if (existing.status === "completed") {
        // Fully idempotent replay: zero new Groq calls, zero new drafts.
        return existing;
      }
      // Resume: the plan is already persisted; only unfinished items are attempted.
      return executeCampaignItems(existing, options);
    }
  }

  let record = createCampaign(objective, count, idempotencyKey);

  const plan = await requestTomCampaignPlan(objective, count, recentWorkContext());
  const schedule = computeCampaignSchedule(count, options.timezone);

  const items: CampaignItemResult[] = plan.map((planned, index) => ({
    sequence: planned.sequence,
    assignedAgent: planned.assignedAgent,
    goal: planned.goal,
    contentType: planned.contentType,
    sourceTheme: planned.sourceTheme,
    rationale: planned.rationale,
    scheduledAt: schedule[index],
    timezone: options.timezone,
    status: "pending",
  }));

  record = saveCampaign({ ...record, status: "in_progress", items });

  return executeCampaignItems(record, options);
}
