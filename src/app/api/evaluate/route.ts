import { NextRequest, NextResponse } from "next/server";
import { writeToOG } from "@/lib/0g/storage";
import { evaluateCondition } from "@/lib/ai/evaluate";
import { computeRecordHash } from "@/lib/crypto/hash";
import { getETHBalance, getTransactions, getTokenTransfers } from "@/lib/data/etherscan";
import { getETHPrice, getTokenId, getTokenPrice } from "@/lib/data/prices";
import { AgentRecord, Instruction } from "@/types";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      instruction: Instruction;
    };

    if (!body.instruction) {
      return NextResponse.json(
        { error: "Missing instruction" },
        { status: 400 }
      );
    }

    const instruction = body.instruction;

    // Fetch real-time data based on condition type
    const realTimeData: Record<string, unknown> = {};

    try {
      switch (instruction.parsed.conditionType) {
        case "wallet_movement": {
          const target = instruction.parsed.target;
          if (target.startsWith("0x")) {
            const [balance, txs] = await Promise.all([
              getETHBalance(target),
              getTransactions(target, 5),
            ]);
            realTimeData.balance = balance;
            realTimeData.recentTransactions = txs;
            realTimeData.currentTime = new Date().toISOString();
          }
          break;
        }
        case "price_threshold": {
          const target = instruction.parsed.target.toLowerCase();
          const tokenId = getTokenId(target);
          if (tokenId) {
            const price = await getTokenPrice(tokenId, "usd");
            realTimeData.price = price;
            realTimeData.currency = "usd";
            realTimeData.token = target;
          } else {
            // Fallback to ETH
            const price = await getETHPrice();
            realTimeData.price = price;
            realTimeData.currency = "usd";
            realTimeData.token = "ethereum";
          }
          break;
        }
        case "token_received": {
          const target = instruction.parsed.target;
          if (target.startsWith("0x")) {
            const transfers = await getTokenTransfers(target, undefined, 5);
            realTimeData.tokenTransfers = transfers;
          }
          break;
        }
        default: {
          // For unimplemented types, return basic ETH data
          const price = await getETHPrice();
          realTimeData.ethPrice = price;
          break;
        }
      }
    } catch {
      // If data fetch fails, still proceed with evaluation
      realTimeData.error = "Failed to fetch real-time data";
    }

    // Run AI evaluation
    let evaluation;
    try {
      evaluation = await evaluateCondition(instruction.parsed, realTimeData);
    } catch {
      evaluation = {
        outcome: "not_triggered" as const,
        reasoning: "AI evaluation unavailable. Condition not triggered.",
        actionTaken: "Continue monitoring",
      };
    }

    // Build the record
    const timestamp = Math.floor(Date.now() / 1000);
    const recordId = randomUUID();
    const recordBase = {
      instructionId: instruction.id,
      walletAddress: instruction.walletAddress,
      conditionChecked: instruction.parsed.raw,
      dataObserved: realTimeData,
      outcome: evaluation.outcome,
      reasoning: evaluation.reasoning,
      actionTaken: evaluation.actionTaken,
      timestamp,
    };

    const recordHash = computeRecordHash(recordBase);

    const record: AgentRecord = {
      id: recordId,
      ...recordBase,
      recordHash,
      ogStorageKey: `records/${instruction.id}/${timestamp}`,
      ogTxHash: null,
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${recordId}`,
    };

    // Write record to 0G
    const result = await writeToOG(record.ogStorageKey, record);
    record.ogTxHash = result.txHash;
    await writeToOG(record.ogStorageKey, record);

    // Update instruction last checked
    instruction.lastCheckedAt = timestamp;
    if (evaluation.outcome === "triggered") {
      instruction.status = "triggered";
      instruction.triggeredAt = timestamp;
    }
    await writeToOG(instruction.ogStorageKey, instruction);

    return NextResponse.json({ record, instruction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Evaluation failed: ${message}` },
      { status: 500 }
    );
  }
}
