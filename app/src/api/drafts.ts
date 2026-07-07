import type { DraftContentType, DraftItem } from "../model/types";

/**
 * Draft queue API client. Talks only to the app's own server boundary.
 * Note the deliberate absence of a destination parameter on create: the
 * server binds every draft to the persisted active publishing selection.
 */

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function apiError(status: number, body: unknown): Error {
  const message =
    typeof body === "object" && body !== null && typeof (body as { error?: unknown }).error === "string"
      ? (body as { error: string }).error
      : `API boundary returned HTTP ${status}`;
  return new Error(message);
}

export interface NewDraftRequest {
  contentType: DraftContentType;
  caption: string;
  mediaRef?: string;
  scheduledAt: string;
  timezone: string;
}

export async function fetchDrafts(): Promise<DraftItem[]> {
  const response = await fetch("/api/social/instagram/drafts");
  const body = await readJson(response);
  if (!response.ok) throw apiError(response.status, body);
  return (body as { drafts: DraftItem[] }).drafts ?? [];
}

export async function createDraft(input: NewDraftRequest): Promise<DraftItem> {
  const response = await fetch("/api/social/instagram/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await readJson(response);
  if (!response.ok) throw apiError(response.status, body);
  return (body as { draft: DraftItem }).draft;
}
