import { generatePersonalBrandContent, type TomAssignment } from "./groq.js";
import { createDraft, type DraftContentType, type DraftItem } from "./draftStore.js";

/**
 * Personal Brand Specialist — execution only.
 *
 * Receives a validated assignment from the manager and executes it through
 * the proven generation path. It never chooses its own mission, never
 * publishes, and never touches destination selection.
 */

export interface ExecutionOptions {
  /** Bound server-side from the persisted active selection; never client-supplied. */
  destinationExternalConnectionId: string;
  scheduledAt: string;
  timezone: string;
}

export async function executePersonalBrandAssignment(
  assignment: TomAssignment,
  options: ExecutionOptions,
): Promise<DraftItem> {
  const generated = await generatePersonalBrandContent({
    goal: assignment.goal,
    contentType: assignment.contentType,
  });

  // Same content-type mapping and flattening the proven M6 route uses.
  const draftContentType: DraftContentType =
    generated.contentType === "motivational_post" ? "image" : generated.contentType;

  const carouselBody =
    generated.contentType === "carousel"
      ? generated.slides.map((slide, index) => `Slide ${index + 1}: ${slide}`).join("\n\n")
      : "";

  const caption = [generated.hook, carouselBody, generated.caption, generated.cta]
    .filter(Boolean)
    .join("\n\n");

  return createDraft({
    destinationExternalConnectionId: options.destinationExternalConnectionId,
    contentType: draftContentType,
    caption,
    scheduledAt: options.scheduledAt,
    timezone: options.timezone,
    createdBy: "agent",
    // Management intent is persisted: the catalog theme Tom assigned.
    // The generator's own sourceTheme is still runtime-validated but may
    // phrase the theme differently; the assigned label is the stable value
    // future manager runs use for repetition avoidance.
    sourceTheme: assignment.sourceTheme,
  });
}
