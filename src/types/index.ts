export type InstructionStatus = "active" | "paused" | "triggered" | "expired";
export type ConditionType =
  | "wallet_movement"
  | "price_threshold"
  | "dao_event"
  | "contract_interaction"
  | "token_received";
export type DecisionOutcome = "triggered" | "not_triggered" | "error";
export type TrendDirection = "improving" | "stable" | "declining";

export interface ParsedInstruction {
  raw: string;
  conditionType: ConditionType;
  target: string;
  threshold: number | null;
  thresholdUnit: string | null;
  action: string;
  confidence: number;
  needsClarification: boolean;
  clarificationQuestion: string | null;
}

export interface Instruction {
  id: string;
  walletAddress: string;
  parsed: ParsedInstruction;
  status: InstructionStatus;
  createdAt: number;
  lastCheckedAt: number | null;
  triggeredAt: number | null;
  ogStorageKey: string;
  ogTxHash: string | null;
}

export interface AgentRecord {
  id: string;
  instructionId: string;
  walletAddress: string;
  conditionChecked: string;
  dataObserved: Record<string, unknown>;
  outcome: DecisionOutcome;
  reasoning: string;
  actionTaken: string;
  timestamp: number;
  recordHash: string;
  ogStorageKey: string;
  ogTxHash: string | null;
  verificationUrl: string;
}

export interface VerificationCertificate {
  record: AgentRecord;
  instruction: Instruction;
  hashValid: boolean;
  retrievedFrom: "0g";
  retrievedAt: number;
}

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface AgentStatus {
  isRunning: boolean;
  lastPollAt: number | null;
  activeInstructions: number;
  totalRecords: number;
}
