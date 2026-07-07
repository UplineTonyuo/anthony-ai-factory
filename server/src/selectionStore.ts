import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Durable storage for the active publishing selection.
 *
 * Single-user, local-first stage: one small JSON file, written atomically
 * (tmp + rename). Holds only safe identifiers — never credentials, tokens,
 * or the Composio API key. Lives in server/data/ (gitignored runtime state).
 */

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const SELECTION_FILE = path.join(DATA_DIR, "active-selection.json");

export interface StoredSelection {
  platform: "instagram";
  /** Provider connection id — the stable selector; internal UI ids are ephemeral. */
  externalConnectionId: string;
  updatedAt: string;
}

export function readSelection(): StoredSelection | null {
  try {
    const raw = JSON.parse(readFileSync(SELECTION_FILE, "utf8")) as unknown;
    if (typeof raw !== "object" || raw === null) return null;
    const record = raw as Record<string, unknown>;
    if (record.platform !== "instagram") return null;
    if (typeof record.externalConnectionId !== "string" || !record.externalConnectionId) return null;
    return {
      platform: "instagram",
      externalConnectionId: record.externalConnectionId,
      updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : "",
    };
  } catch {
    // Missing or unreadable file simply means no selection is stored.
    return null;
  }
}

export function writeSelection(externalConnectionId: string): StoredSelection {
  const selection: StoredSelection = {
    platform: "instagram",
    externalConnectionId,
    updatedAt: new Date().toISOString(),
  };
  mkdirSync(DATA_DIR, { recursive: true });
  const tmpFile = `${SELECTION_FILE}.tmp`;
  writeFileSync(tmpFile, JSON.stringify(selection, null, 2));
  renameSync(tmpFile, SELECTION_FILE);
  return selection;
}
