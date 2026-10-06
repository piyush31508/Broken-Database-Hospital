import { NextResponse } from "next/server";
import { tryCreateServerClient } from "@/lib/supabase/server";

type QueryRequest = {
  query?: string;
  playerId?: string;
};

function isAllowedCase003IndexQuery(query: string): boolean {
  const normalized = query
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  const expectedPattern =
    /^create\s+index\s+(if\s+not\s+exists\s+)?idx_surgeries_date_room_start\s+on\s+(hospital\.)?surgeries\s*\(\s*surgery_date\s*,\s*room_id\s*,\s*start_time\s*\)\s*;?$/;

  return expectedPattern.test(normalized);
}

function isCreateIndexQuery(query: string): boolean {
  return /^\s*create\s+index\b/i.test(query);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QueryRequest;
    const query = body.query?.trim();
    const playerId = body.playerId?.trim();

   
    
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Query cannot be empty.",
        },
        { status: 400 },
      );
    }

    if (query.length > 10_000) {
      return NextResponse.json(
        {
          success: false,
          error: "Query is too long.",
        },
        { status: 400 },
      );
    }

    const supabase = await tryCreateServerClient();

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: "Database is not configured.",
        },
        { status: 500 },
      );
    }

    // -----------------------------------------------------------------------
    // Case 003 — Controlled CREATE INDEX support
    // -----------------------------------------------------------------------

    if (isCreateIndexQuery(query)) {
      if (!isAllowedCase003IndexQuery(query)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "CREATE INDEX is restricted in the debugging game. Only the Case 003 OR schedule index can be created.",
          },
          { status: 400 },
        );
      }

      if (!playerId) {
        return NextResponse.json(
          {
            success: false,
            error: "Player ID is required.",
          },
          { status: 400 },
        );
      }

      // Record the Case 003 index action for this player.
      const { data, error } = await supabase.rpc(
        "record_case_003_index",
        {
          p_player_id: playerId,
        }
      );

      if (error) {
        console.error(
          "Case 003 index recording error:",
          error,
        );

        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 },
        );
      }

      const rows = Array.isArray(data) ? data : [];

      return NextResponse.json({
        success: true,
        rows,
        rowCount: rows.length,
      });
    }

    // -----------------------------------------------------------------------
    // Normal queries — remain read-only
    // -----------------------------------------------------------------------

    const { data, error } = await supabase.rpc(
      "execute_readonly_query",
      {
        query_text: query,
      },
    );

    if (error) {
      console.error("SQL execution error:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 },
      );
    }

    const rows = Array.isArray(data) ? data : [];

    return NextResponse.json({
      success: true,
      rows,
      rowCount: rows.length,
    });
  } catch (error) {
    console.error("Query API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to execute query.",
      },
      { status: 500 },
    );
  }
}