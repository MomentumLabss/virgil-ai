import { NextRequest, NextResponse } from "next/server";
import { readFromOG, listKeysFromOG } from "@/lib/0g/storage";
import { verifyRecordHash } from "@/lib/crypto/hash";
import { AgentRecord, Instruction, VerificationCertificate } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const recordId = req.nextUrl.searchParams.get("id");

    if (!recordId) {
      return NextResponse.json(
        { error: "Missing record ID" },
        { status: 400 }
      );
    }

    // Find the record by searching through all record keys
    const allRecordKeys = await listKeysFromOG("records/");
    let record: AgentRecord | null = null;

    for (const key of allRecordKeys) {
      const data = await readFromOG<AgentRecord>(key);
      if (data && data.id === recordId) {
        record = data;
        break;
      }
    }

    if (!record) {
      return NextResponse.json(
        { error: "Record not found on 0G" },
        { status: 404 }
      );
    }

    // Verify the hash
    const hashValid = verifyRecordHash(
      {
        instructionId: record.instructionId,
        walletAddress: record.walletAddress,
        conditionChecked: record.conditionChecked,
        dataObserved: record.dataObserved,
        outcome: record.outcome,
        reasoning: record.reasoning,
        actionTaken: record.actionTaken,
        timestamp: record.timestamp,
      },
      record.recordHash
    );

    // Fetch the associated instruction
    const instructionKey = `instructions/${record.walletAddress}/${record.instructionId}`;
    const instruction = await readFromOG<Instruction>(instructionKey);

    const certificate: VerificationCertificate = {
      record,
      instruction:
        instruction || ({
          id: record.instructionId,
          walletAddress: record.walletAddress,
          parsed: {
            raw: record.conditionChecked,
            conditionType: "wallet_movement",
            target: "",
            threshold: null,
            thresholdUnit: null,
            action: "",
            confidence: 0,
            needsClarification: false,
            clarificationQuestion: null,
          },
          status: "triggered",
          createdAt: record.timestamp,
          lastCheckedAt: record.timestamp,
          triggeredAt: record.timestamp,
          ogStorageKey: instructionKey,
          ogTxHash: null,
        } as Instruction),
      hashValid,
      retrievedFrom: "0g",
      retrievedAt: Math.floor(Date.now() / 1000),
    };

    return NextResponse.json({ certificate });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Verification failed: ${message}` },
      { status: 500 }
    );
  }
}
