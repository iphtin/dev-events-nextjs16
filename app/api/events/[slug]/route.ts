import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Event, type EventDocument } from "@/database";

/**
 * Slug rules aligned with `database/event.model.ts` slugify():
 * - lowercase a-z, 0-9
 * - hyphen-separated segments
 * - no leading/trailing hyphen
 */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ErrorResponse = { message: string };

type SuccessResponse = {
  message: string;
  event: EventDocument;
};

type RouteContext = {
  // Next.js (in your setup) types `params` as a Promise.
  params: Promise<{ slug: string }>;
};

function jsonError(message: string, status: number): NextResponse<ErrorResponse> {
  return NextResponse.json({ message }, { status });
}

/**
 * Fetch `slug` from either the dynamic route segment (`/api/events/:slug`)
 * or the query string (`/api/events?slug=...`) as a fallback.
 */
async function getSlug(req: NextRequest, params: RouteContext["params"]): Promise<string | null> {
  let fromParams: string | null = null;
  try {
    const resolved = await params;
    fromParams = resolved?.slug ?? null;
  } catch {
    // If params resolution fails, we fall back to query string.
  }

  if (typeof fromParams === "string" && fromParams.trim().length > 0) return fromParams;

  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("slug");
  if (typeof fromQuery === "string" && fromQuery.trim().length > 0) return fromQuery;

  return null;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const slug = await getSlug(req, context.params);

    // Validate required slug (param or query)
    if (!slug) {
      return jsonError(
        "Missing required slug. Use /api/events/{slug} (preferred) or /api/events?slug={slug}.",
        400
      );
    }

    // Enforce canonical slug format for consistent querying
    if (!SLUG_REGEX.test(slug)) {
      return jsonError(
        "Invalid slug format. Expected lowercase letters/numbers with optional hyphens (e.g. 'my-event-1').",
        400
      );
    }

    await connectToDatabase();

    // Keep the result typed with your existing `EventDocument` interface.
    const event = await Event.findOne({ slug }).exec();

    if (!event) {
      return jsonError("Event not found.", 404);
    }

    // NextResponse.json will serialize the Mongoose document via its toJSON/toObject behavior.
    return NextResponse.json({ message: "Event fetched successfully", event }, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/events/[slug] failed:", err);
    return jsonError("Unexpected server error.", 500);
  }
}
 