import { createServer, type IncomingMessage } from "node:http";
import {
  ConfigurationError,
  getInstagramConnectionStatus,
  listInstagramAccounts,
  testInstagramConnection,
} from "./composio.js";
import { readSelection, writeSelection } from "./selectionStore.js";

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
