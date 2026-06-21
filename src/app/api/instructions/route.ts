import { NextRequest, NextResponse } from "next/server";
import { writeToOG, readFromOG, listKeysFromOG } from "@/lib/0g/storage";
import { Instruction, ParsedInstruction } from "@/types";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      parsed: ParsedInstruction;
      walletAddress: string;
    };

    if (!body.parsed || !body.walletAddress) {
      return NextResponse.json(
        { error: "Missing parsed instruction or wallet address" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const instruction: Instruction = {
      id,
      walletAddress: body.walletAddress,
      parsed: body.parsed,
      status: "active",
      createdAt: Math.floor(Date.now() / 1000),
      lastCheckedAt: null,
      triggeredAt: null,
      ogStorageKey: `instructions/${body.walletAddress}/${id}`,
      ogTxHash: null,
    };

    const result = await writeToOG(instruction.ogStorageKey, instruction);
    instruction.ogTxHash = result.txHash;

    // Re-write with the tx hash
    await writeToOG(instruction.ogStorageKey, instruction);

    return NextResponse.json({ instruction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to save instruction: ${message}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");
    if (!wallet) {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 }
      );
    }

    const prefix = `instructions/${wallet}`;
    const keys = await listKeysFromOG(prefix);

    const instructions: Instruction[] = [];
    for (const key of keys) {
      const data = await readFromOG<Instruction>(key);
      if (data) {
        instructions.push(data);
      }
    }

    instructions.sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json({ instructions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch instructions: ${message}` },
      { status: 500 }
    );
  }
}
