import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Durable draft content queue — same local-first pattern as selectionStore:
 * one JSON file in server/data/ (gitignored runtime state), atomic writes
 * via tmp + rename, no database, no dependencies. Safe identifiers and
 * user-authored content only; never credentials.
 */

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const DRAFTS_FILE = path.join(DATA_DIR, "drafts.json");

export type DraftContentType = "reel" | "image" | "carousel";

export interface DraftItem {
  id: string;
  platform: "instagram";
  /** Bound server-side from the persisted active selection; never client-supplied. */
  destinationExternalConnectionId: string;
  contentType: DraftContentType;
  caption: string;
  mediaRef?: string;
  /** ISO timestamp of the intended publish time. */
  scheduledAt: string;
  /** IANA timezone the time was entered in (stored explicitly). */
  timezone: string;
  status: "draft";
  createdBy: "human" | "agent";
  createdAt: string;
  updatedAt: string;
}

export interface NewDraftInput {
  destinationExternalConnectionId: string;
  contentType: DraftContentType;
  caption: string;
  mediaRef?: string;
  scheduledAt: string;
  timezone: string;
  createdBy: "human" | "agent";
}

function isDraftItem(value: unknown): value is DraftItem {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    record.platform === "instagram" &&
    typeof record.destinationExternalConnectionId === "string" &&
    (record.contentType === "reel" || record.contentType === "image" || record.contentType === "carousel") &&
    typeof record.caption === "string" &&
    typeof record.scheduledAt === "string" &&
    typeof record.timezone === "string" &&
    record.status === "draft"
  );
}

export function listDrafts(): DraftItem[] {
  try {
    const raw = JSON.parse(readFileSync(DRAFTS_FILE, "utf8")) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter(isDraftItem);
  } catch {
    // Missing or unreadable file simply means no drafts yet.
    return [];
  }
}

export function createDraft(input: NewDraftInput): DraftItem {
  const now = new Date().toISOString();
  const draft: DraftItem = {
    id: `draft_${randomUUID()}`,
    platform: "instagram",
    destinationExternalConnectionId: input.destinationExternalConnectionId,
    contentType: input.contentType,
    caption: input.caption,
    ...(input.mediaRef ? { mediaRef: input.mediaRef } : {}),
    scheduledAt: input.scheduledAt,
    timezone: input.timezone,
    status: "draft",
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };
  const drafts = [...listDrafts(), draft];
  mkdirSync(DATA_DIR, { recursive: true });
  const tmpFile = `${DRAFTS_FILE}.tmp`;
  writeFileSync(tmpFile, JSON.stringify(drafts, null, 2));
  renameSync(tmpFile, DRAFTS_FILE);
  return draft;
}
