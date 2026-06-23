import { NextRequest, NextResponse } from "next/server";
import { parseInstruction } from "@/lib/ai/parse";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { instruction: string };

    if (!body.instruction || typeof body.instruction !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid instruction" },
        { status: 400 }
      );
    }

    const parsed = await parseInstruction(body.instruction);
    return NextResponse.json({ parsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    
    if (message.includes("JSON") || message.includes("parse")) {
      return NextResponse.json(
        { error: "Could not parse instruction - please try rephrasing" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Failed to parse instruction: ${message}` },
      { status: 500 }
    );
  }
}
