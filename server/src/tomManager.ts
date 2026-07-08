import { requestTomAssignment, type RecentWorkItem, type TomAssignment } from "./groq.js";
import { listDrafts, type DraftItem } from "./draftStore.js";
import { executePersonalBrandAssignment, type ExecutionOptions } from "./personalBrandWorker.js";

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
