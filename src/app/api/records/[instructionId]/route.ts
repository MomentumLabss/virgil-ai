import { NextResponse } from "next/server";
import { AgentRecord } from "@/types";
import { listKeysFromOG, readFromOG } from "@/lib/0g/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ instructionId: string }> }
) {
  try {
    const { instructionId } = await params;
    if (!instructionId) {
      return NextResponse.json(
        { error: "Instruction ID is required" },
        { status: 400 }
      );
    }

    const prefix = `records/${instructionId}/`;
    const keys = await listKeysFromOG(prefix);

    const records: AgentRecord[] = [];
    await Promise.all(
      keys.map(async (key) => {
        try {
          const record = await readFromOG<AgentRecord>(key);
          if (record) {
            records.push(record);
          }
        } catch (err) {
          console.error(`Failed to read record at key ${key}`, err);
        }
      })
    );

    records.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Failed to fetch records:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
