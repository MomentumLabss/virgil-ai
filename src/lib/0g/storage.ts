import { OGError } from "./types";

// KEY INDEX: Maps logical storage keys to 0G transaction 
// hashes. Persists in memory for server lifetime. In 
// production, this index would be stored in a lightweight 
// database (e.g. SQLite or Redis) so it survives restarts.
// For the hackathon demo, in-memory is sufficient because 
// the server stays running during judging.
const keyIndex = new Map<string, string>();

// In-memory fallback for development when 0G is not configured
const memoryStore = new Map<string, string>();
const memoryIndex = new Map<string, string[]>(); // prefix -> keys

function getMemoryKey(key: string): string {
  return `virgil:${key}`;
}

export async function writeToOG(
  key: string,
  data: unknown
): Promise<{ txHash: string | null }> {
  const serialized = JSON.stringify(data);
  const privateKey = process.env.OG_PRIVATE_KEY;
  const rpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL;
  const storageRpc = process.env.NEXT_PUBLIC_0G_STORAGE_RPC;

  // If 0G is not configured, use memory store with a clear warning
  if (!privateKey || !rpcUrl || !storageRpc) {
    const memKey = getMemoryKey(key);
    memoryStore.set(memKey, serialized);

    // Update index
    const parts = key.split("/");
    for (let i = 1; i <= parts.length; i++) {
      const prefix = parts.slice(0, i).join("/");
      const existing = memoryIndex.get(prefix) || [];
      if (!existing.includes(key)) {
        memoryIndex.set(prefix, [...existing, key]);
      }
    }

    // Return a fake tx hash to indicate memory storage
    return { txHash: `memory-${Date.now()}` };
  }

  // Real 0G upload
  try {
    const { Uploader } = await import("@0gfoundation/0g-ts-sdk");
    const uploader = new Uploader(storageRpc, rpcUrl, privateKey);

    // Create a file from the serialized data
    const blob = new Blob([serialized], { type: "application/json" });
    const file = new File([blob], `${key}.json`);

    const result = await uploader.uploadFile(file);
    if (result) {
      keyIndex.set(key, result);
    }
    return { txHash: result || null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new OGError(
      `Failed to write to 0G: ${message}`,
      "WRITE_FAILED"
    );
  }
}

export async function readFromOG<T>(key: string): Promise<T | null> {
  const privateKey = process.env.OG_PRIVATE_KEY;
  const storageRpc = process.env.NEXT_PUBLIC_0G_STORAGE_RPC;
  const rpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL;

  // If not configured, check memory store
  if (!privateKey || !storageRpc || !rpcUrl) {
    const memKey = getMemoryKey(key);
    const data = memoryStore.get(memKey);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  // Real 0G read
  try {
    const txHash = keyIndex.get(key);
    if (!txHash) return null;

    const { Downloader } = await import("@0gfoundation/0g-ts-sdk");
    const downloader = new Downloader(storageRpc, rpcUrl);
    
    const fileBuffer = await downloader.downloadFile(txHash);
    if (!fileBuffer) return null;
    
    // The downloader returns the file content as an ArrayBuffer or Buffer
    const jsonStr = new TextDecoder().decode(fileBuffer);
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

export async function listKeysFromOG(prefix: string): Promise<string[]> {
  const privateKey = process.env.OG_PRIVATE_KEY;
  const storageRpc = process.env.NEXT_PUBLIC_0G_STORAGE_RPC;

  if (!privateKey || !storageRpc) {
    // Check memory index
    return memoryIndex.get(prefix) || [];
  }

  // Real 0G listing using the in-memory index
  const keys = [];
  for (const key of keyIndex.keys()) {
    if (key.startsWith(prefix)) {
      keys.push(key);
    }
  }
  return keys;
}

export async function keyExistsOnOG(key: string): Promise<boolean> {
  const privateKey = process.env.OG_PRIVATE_KEY;
  const storageRpc = process.env.NEXT_PUBLIC_0G_STORAGE_RPC;

  if (!privateKey || !storageRpc) {
    return memoryStore.has(getMemoryKey(key));
  }

  return keyIndex.has(key);
}

// For demo/testing: get all memory-stored data
export function getMemoryStoreDebug(): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  memoryStore.forEach((value, key) => {
    try {
      result[key] = JSON.parse(value);
    } catch {
      result[key] = value;
    }
  });
  return result;
}
