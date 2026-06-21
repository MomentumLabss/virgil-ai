import { sha256 } from "js-sha256";

export function computeRecordHash(record: {
  instructionId: string;
  walletAddress: string;
  conditionChecked: string;
  dataObserved: Record<string, unknown>;
  outcome: string;
  reasoning: string;
  actionTaken: string;
  timestamp: number;
}): string {
  const canonical = JSON.stringify(record, Object.keys(record).sort());
  return sha256(canonical);
}

export function verifyRecordHash(
  record: {
    instructionId: string;
    walletAddress: string;
    conditionChecked: string;
    dataObserved: Record<string, unknown>;
    outcome: string;
    reasoning: string;
    actionTaken: string;
    timestamp: number;
  },
  expectedHash: string
): boolean {
  const computed = computeRecordHash(record);
  return computed === expectedHash;
}
