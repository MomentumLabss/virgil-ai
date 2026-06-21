import { OGError } from "./types";

let clientInstance: unknown | null = null;
let isConfigured = false;

export function isOGConfigured(): boolean {
  return isConfigured;
}

export function getOGClient(): unknown {
  if (!isConfigured) {
    throw new OGError(
      "0G Storage is not configured. Please set OG_PRIVATE_KEY, NEXT_PUBLIC_0G_RPC_URL, and NEXT_PUBLIC_0G_STORAGE_RPC in your .env.local file.",
      "NOT_CONFIGURED"
    );
  }
  if (!clientInstance) {
    throw new OGError(
      "0G client failed to initialize. Check your configuration.",
      "UNAVAILABLE"
    );
  }
  return clientInstance;
}

export async function initOGClient(): Promise<void> {
  const privateKey = process.env.OG_PRIVATE_KEY;
  const rpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL;
  const storageRpc = process.env.NEXT_PUBLIC_0G_STORAGE_RPC;

  if (!privateKey || !rpcUrl || !storageRpc) {
    isConfigured = false;
    clientInstance = null;
    return;
  }

  try {
    const { Indexer, ZgFile, Uploader } = await import("@0glabs/0g-ts-sdk");

    const uploader = new Uploader(storageRpc, rpcUrl, privateKey);

    clientInstance = {
      indexer: new Indexer(storageRpc),
      uploader,
      ZgFile,
    };

    isConfigured = true;
  } catch {
    isConfigured = false;
    clientInstance = null;
  }
}
