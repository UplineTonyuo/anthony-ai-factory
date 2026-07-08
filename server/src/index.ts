import { createServer, type IncomingMessage } from "node:http";
import {
  ConfigurationError,
  getInstagramConnectionStatus,
  listInstagramAccounts,
  testInstagramConnection,
} from "./composio.js";
import { readSelection, writeSelection } from "./selectionStore.js";
import {
  generatePersonalBrandContent,
  type PersonalBrandContentType,
} from "./groq.js";
import { createDraft, listDrafts, type DraftContentType } from "./draftStore.js";
import { runTomDelegation, runTomCampaign } from "./tomManager.js";
import { findByIdempotencyKey } from "./campaignStore.js";

/**
 * Minimal deployable API boundary between the browser and Composio.
 * The browser only ever talks to these routes; the Composio API key
 * never leaves this process.
 */

const PORT = Number(process.env.PORT ?? 8787);

function sendJson(res: import("node:http").ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function errorStatus(e: unknown): number {
  return e instanceof ConfigurationError ? 503 : 502;
}

function errorBody(e: unknown): { error: string } {
  const message = e instanceof Error ? e.message : String(e);
  // Cap length so upstream stack dumps never flood the client.
  return { error: message.slice(0, 500) };
}

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown> | null> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > 10_000) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (chunks.length === 0) return resolve(null);
      try {
        const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        resolve(typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null);
      } catch {
        resolve(null);
      }
    });
    req.on("error", reject);
  });
}

/** The selection is only accepted/returned when the connection is live and usable. */
async function validateSelection(
  externalConnectionId: string,
): Promise<{ ok: true } | { ok: false; code: number; reason: string }> {
  const info = await getInstagramConnectionStatus(externalConnectionId);
  if (!info.exists) {
    return { ok: false, code: 404, reason: "Selected connection no longer exists at the provider." };
  }
  if (info.toolkitSlug !== "instagram") {
    return { ok: false, code: 409, reason: "Selected connection is not an Instagram connection." };
  }
  if (info.status !== "ACTIVE") {
    return { ok: false, code: 409, reason: `Selected connection is not active (status: ${info.status}).` };
  }
  return { ok: true };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const route = `${req.method} ${url.pathname}`;

  try {
    if (route === "GET /api/health") {
      sendJson(res, 200, {
        ok: true,
        composioConfigured: Boolean(process.env.COMPOSIO_API_KEY),
        identityToolConfigured: Boolean(process.env.COMPOSIO_INSTAGRAM_IDENTITY_TOOL),
      });
      return;
    }

    if (route === "GET /api/social/instagram/accounts") {
      const accounts = await listInstagramAccounts();
      sendJson(res, 200, { accounts });
      return;
    }

    if (route === "GET /api/social/instagram/test") {
      const connectionId = url.searchParams.get("connectionId");
      if (!connectionId) {
        sendJson(res, 400, { error: "Missing required query parameter: connectionId" });
        return;
      }
      const result = await testInstagramConnection(connectionId);
      sendJson(res, 200, result);
      return;
    }

    if (route === "GET /api/social/instagram/active-selection") {
      const stored = readSelection();
      if (!stored) {
        sendJson(res, 200, { active: null });
        return;
      }
      const check = await validateSelection(stored.externalConnectionId);
      if (!check.ok) {
        sendJson(res, 200, { active: null, issue: check.reason });
        return;
      }
      sendJson(res, 200, {
        active: { platform: stored.platform, externalConnectionId: stored.externalConnectionId },
      });
      return;
    }

    if (route === "PUT /api/social/instagram/active-selection") {
      const body = await readJsonBody(req);
      const externalConnectionId =
        body && typeof body.externalConnectionId === "string" ? body.externalConnectionId.trim() : "";
      if (!externalConnectionId) {
        sendJson(res, 400, { error: "Missing required field: externalConnectionId" });
        return;
      }
      const check = await validateSelection(externalConnectionId);
      if (!check.ok) {
        sendJson(res, check.code, { error: check.reason });
        return;
      }
      const stored = writeSelection(externalConnectionId);
      sendJson(res, 200, {
        active: { platform: stored.platform, externalConnectionId: stored.externalConnectionId },
      });
      return;
    }

    if (route === "GET /api/social/instagram/drafts") {
      sendJson(res, 200, { drafts: listDrafts() });
      return;
    }

    if (route === "POST /api/social/instagram/drafts") {
      const body = await readJsonBody(req);
      const contentType = body?.contentType;
      if (contentType !== "reel" && contentType !== "image" && contentType !== "carousel") {
        sendJson(res, 400, { error: "contentType must be one of: reel, image, carousel" });
        return;
      }
      const caption = typeof body?.caption === "string" ? body.caption.trim() : "";
      if (!caption) {
        sendJson(res, 400, { error: "Missing required field: caption" });
        return;
      }
      const scheduledAt = typeof body?.scheduledAt === "string" ? body.scheduledAt : "";
      if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt))) {
        sendJson(res, 400, { error: "scheduledAt must be a valid ISO timestamp" });
        return;
      }
      const timezone = typeof body?.timezone === "string" && body.timezone ? body.timezone : "Asia/Manila";
      try {
        new Intl.DateTimeFormat("en", { timeZone: timezone });
      } catch {
        sendJson(res, 400, { error: `Unknown IANA timezone: ${timezone.slice(0, 60)}` });
        return;
      }
      const mediaRef = typeof body?.mediaRef === "string" && body.mediaRef.trim() ? body.mediaRef.trim() : undefined;

      // Destination is bound server-side from the persisted active selection —
      // the client cannot choose or spoof it.
      const stored = readSelection();
      if (!stored) {
        sendJson(res, 409, {
          error: "No active publishing destination is set. Select an active publishing account first.",
        });
        return;
      }
      const check = await validateSelection(stored.externalConnectionId);
      if (!check.ok) {
        sendJson(res, 409, {
          error: `Active publishing destination is not usable: ${check.reason}`,
        });
        return;
      }

      const draft = createDraft({
        destinationExternalConnectionId: stored.externalConnectionId,
        contentType: contentType as DraftContentType,
        caption,
        mediaRef,
        scheduledAt,
        timezone,
        createdBy: "human",
      });
      sendJson(res, 201, { draft });
      return;
    }

    if (route === "POST /api/agents/personal-brand/draft") {
      const body = await readJsonBody(req);

      const goal =
        typeof body?.goal === "string" ? body.goal.trim() : "";

      if (!goal) {
        sendJson(res, 400, {
          error: "Missing required field: goal",
        });
        return;
      }

      const contentType = body?.contentType;

      if (
        contentType !== "carousel" &&
        contentType !== "motivational_post" &&
        contentType !== "reel"
      ) {
        sendJson(res, 400, {
          error:
            "contentType must be one of: carousel, motivational_post, reel",
        });
        return;
      }

      const scheduledAt =
        typeof body?.scheduledAt === "string"
          ? body.scheduledAt
          : "";

      if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt))) {
        sendJson(res, 400, {
          error: "scheduledAt must be a valid ISO timestamp",
        });
        return;
      }

      const timezone =
        typeof body?.timezone === "string" && body.timezone
          ? body.timezone
          : "Asia/Manila";

      try {
        new Intl.DateTimeFormat("en", { timeZone: timezone });
      } catch {
        sendJson(res, 400, {
          error: `Unknown IANA timezone: ${timezone.slice(0, 60)}`,
        });
        return;
      }

      const stored = readSelection();

      if (!stored) {
        sendJson(res, 409, {
          error:
            "No active publishing destination is set. Select an active publishing account first.",
        });
        return;
      }

      const check = await validateSelection(
        stored.externalConnectionId,
      );

      if (!check.ok) {
        sendJson(res, 409, {
          error:
            `Active publishing destination is not usable: ${check.reason}`,
        });
        return;
      }

      const generated = await generatePersonalBrandContent({
        goal,
        contentType: contentType as PersonalBrandContentType,
      });

      const draftContentType: DraftContentType =
        generated.contentType === "motivational_post"
          ? "image"
          : generated.contentType;

      const carouselBody =
        generated.contentType === "carousel"
          ? generated.slides
              .map((slide, index) => `Slide ${index + 1}: ${slide}`)
              .join("\n\n")
          : "";

      const caption = [
        generated.hook,
        carouselBody,
        generated.caption,
        generated.cta,
      ]
        .filter(Boolean)
        .join("\n\n");

      const draft = createDraft({
        destinationExternalConnectionId:
          stored.externalConnectionId,
        contentType: draftContentType,
        caption,
        scheduledAt,
        timezone,
        createdBy: "agent",
      });

      sendJson(res, 201, {
        draft,
        generated,
      });
      return;
    }

    if (route === "POST /api/agents/tom/run") {
      const body = await readJsonBody(req);

      // Temporary deterministic persistence fallback: DraftItem requires
      // scheduledAt/timezone, so a default is computed HERE at the route
      // boundary. It is not an agent decision and not scheduling
      // intelligence — a future scheduling policy/agent replaces this
      // default without touching Tom or the specialist.
      let scheduledAt = typeof body?.scheduledAt === "string" ? body.scheduledAt : "";
      if (scheduledAt && Number.isNaN(Date.parse(scheduledAt))) {
        sendJson(res, 400, { error: "scheduledAt must be a valid ISO timestamp" });
        return;
      }
      if (!scheduledAt) {
        scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }
      const timezone = typeof body?.timezone === "string" && body.timezone ? body.timezone : "Asia/Manila";
      try {
        new Intl.DateTimeFormat("en", { timeZone: timezone });
      } catch {
        sendJson(res, 400, { error: `Unknown IANA timezone: ${timezone.slice(0, 60)}` });
        return;
      }

      // Destination is bound server-side from the persisted active selection —
      // the client cannot choose or spoof it.
      const stored = readSelection();
      if (!stored) {
        sendJson(res, 409, {
          error: "No active publishing destination is set. Select an active publishing account first.",
        });
        return;
      }
      const check = await validateSelection(stored.externalConnectionId);
      if (!check.ok) {
        sendJson(res, 409, {
          error: `Active publishing destination is not usable: ${check.reason}`,
        });
        return;
      }

      const result = await runTomDelegation({
        destinationExternalConnectionId: stored.externalConnectionId,
        scheduledAt,
        timezone,
      });
      sendJson(res, 201, { assignment: result.assignment, draft: result.draft });
      return;
    }

    if (route === "POST /api/agents/tom/campaigns") {
      const body = await readJsonBody(req);

      const objective = typeof body?.objective === "string" ? body.objective.trim() : "";
      if (!objective) {
        sendJson(res, 400, { error: "Missing required field: objective" });
        return;
      }

      const count = body?.count;
      if (count !== 3) {
        sendJson(res, 400, {
          error: "count must be exactly 3 for this milestone's campaign proof.",
        });
        return;
      }

      const timezone = typeof body?.timezone === "string" && body.timezone ? body.timezone : "Asia/Manila";
      try {
        new Intl.DateTimeFormat("en", { timeZone: timezone });
      } catch {
        sendJson(res, 400, { error: `Unknown IANA timezone: ${timezone.slice(0, 60)}` });
        return;
      }

      const idempotencyKeyHeader = req.headers["idempotency-key"];
      const idempotencyKey =
        typeof idempotencyKeyHeader === "string" && idempotencyKeyHeader.trim()
          ? idempotencyKeyHeader.trim().slice(0, 200)
          : undefined;

      // Destination is bound server-side from the persisted active selection —
      // the client cannot choose or spoof it.
      const stored = readSelection();
      if (!stored) {
        sendJson(res, 409, {
          error: "No active publishing destination is set. Select an active publishing account first.",
        });
        return;
      }
      const check = await validateSelection(stored.externalConnectionId);
      if (!check.ok) {
        sendJson(res, 409, {
          error: `Active publishing destination is not usable: ${check.reason}`,
        });
        return;
      }

      const isNewCampaign = !idempotencyKey || !findByIdempotencyKey(idempotencyKey);

      const campaign = await runTomCampaign(objective, count, idempotencyKey, {
        destinationExternalConnectionId: stored.externalConnectionId,
        timezone,
      });

      sendJson(res, isNewCampaign ? 201 : 200, { campaign });
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (e) {
    console.error(`[server] ${route} failed:`, e instanceof Error ? e.message : e);
    sendJson(res, errorStatus(e), errorBody(e));
  }
});

server.listen(PORT, () => {
  console.log(`[server] API boundary listening on http://localhost:${PORT}`);
  if (!process.env.COMPOSIO_API_KEY) {
    console.warn("[server] COMPOSIO_API_KEY is not set — real-mode requests will return an honest 503.");
  }
});
