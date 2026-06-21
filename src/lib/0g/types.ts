export interface OGWriteResult {
  txHash: string | null;
}

export interface OGReadResult<T> {
  data: T | null;
  exists: boolean;
}

export class OGError extends Error {
  constructor(
    message: string,
    public readonly code: "UNAVAILABLE" | "WRITE_FAILED" | "READ_FAILED" | "NOT_CONFIGURED"
  ) {
    super(message);
    this.name = "OGError";
  }
}
