import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { TomCampaignItem } from "./groq.js";

/**
 * Durable campaign record — same local-first pattern as draftStore and
 * selectionStore: one JSON file in server/data/, atomic tmp+rename writes,
 * no database, no queue framework.
 *
 * Exists for two honest reasons only:
 *  1. Partial-failure visibility: 3-draft creation is not atomic, so the
 *     per-item outcome must be observable, not silently claimed as full
 *     success.
 *  2. Idempotency: an Idempotency-Key lets a retried request return/resume
 *     the existing campaign instead of blindly creating a second one.
 */

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const CAMPAIGNS_FILE = path.join(DATA_DIR, "campaigns.json");

export type CampaignItemStatus = "pending" | "success" | "failed";

export interface CampaignItemResult {
  sequence: number;
  assignedAgent: "personal-brand";
  goal: string;
  contentType: TomCampaignItem["contentType"];
  sourceTheme: string;
  rationale: string;
  scheduledAt: string;
  timezone: string;
  status: CampaignItemStatus;
  /** Set once the item executes successfully. */
  draftId?: string;
  /** Honest sanitized failure reason, set only when status is "failed". */
  error?: string;
}

export type CampaignStatus = "planning" | "in_progress" | "completed" | "failed";

export interface CampaignRecord {
  id: string;
  idempotencyKey?: string;
  objective: string;
  count: number;
  status: CampaignStatus;
  items: CampaignItemResult[];
  createdAt: string;
  updatedAt: string;
}

function isCampaignRecord(value: unknown): value is CampaignRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.objective === "string" &&
    typeof record.count === "number" &&
    typeof record.status === "string" &&
    Array.isArray(record.items) &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string" &&
    (record.idempotencyKey === undefined || typeof record.idempotencyKey === "string")
  );
}

function readAll(): CampaignRecord[] {
  try {
    const raw = JSON.parse(readFileSync(CAMPAIGNS_FILE, "utf8")) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter(isCampaignRecord);
  } catch {
    return [];
  }
}

function writeAll(campaigns: CampaignRecord[]): void {
  mkdirSync(DATA_DIR, { recursive: true });
  const tmpFile = `${CAMPAIGNS_FILE}.tmp`;
  writeFileSync(tmpFile, JSON.stringify(campaigns, null, 2));
  renameSync(tmpFile, CAMPAIGNS_FILE);
}

export function findByIdempotencyKey(key: string): CampaignRecord | null {
  return readAll().find((c) => c.idempotencyKey === key) ?? null;
}

export function createCampaign(
  objective: string,
  count: number,
  idempotencyKey: string | undefined,
): CampaignRecord {
  const now = new Date().toISOString();
  const record: CampaignRecord = {
    id: `campaign_${randomUUID()}`,
    ...(idempotencyKey ? { idempotencyKey } : {}),
    objective,
    count,
    status: "planning",
    items: [],
    createdAt: now,
    updatedAt: now,
  };
  const campaigns = [...readAll(), record];
  writeAll(campaigns);
  return record;
}

export function saveCampaign(updated: CampaignRecord): CampaignRecord {
  const withUpdatedTimestamp = { ...updated, updatedAt: new Date().toISOString() };
  const campaigns = readAll().map((c) => (c.id === updated.id ? withUpdatedTimestamp : c));
  writeAll(campaigns);
  return withUpdatedTimestamp;
}
