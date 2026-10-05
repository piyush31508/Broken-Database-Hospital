import { NextResponse } from "next/server";
import { tryCreateServerClient } from "@/lib/supabase/server";

type QueryRequest = {
  query?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QueryRequest;
    const query = body.query?.trim();

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

    const supabase = tryCreateServerClient();

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: "Database is not configured.",
        },
        { status: 500 },
      );
    }

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