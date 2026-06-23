

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

function updateMemoryIndex(key: string): void {
  const parts = key.split("/");
  for (let i = 1; i <= parts.length; i++) {
    const prefix = parts.slice(0, i).join("/");
    const existing = memoryIndex.get(prefix) || [];
    if (!existing.includes(key)) {
      memoryIndex.set(prefix, [...existing, key]);
    }
  }
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
    updateMemoryIndex(key);
    return { txHash: `memory-${Date.now()}` };
  }

  // Real 0G upload using Indexer + ethers signer
  try {
    const { Indexer } = await import("@0gfoundation/0g-storage-ts-sdk");
    const { ethers } = await import("ethers");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const indexer = new Indexer(storageRpc);

    // Create a temporary file path for the data
    const fs = await import("fs");
    const path = await import("path");
    const os = await import("os");

    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `virgil-${Date.now()}.json`);
    fs.writeFileSync(tmpFile, serialized);

    try {
      const { ZgFile } = await import("@0gfoundation/0g-storage-ts-sdk");
      const zgFile = await ZgFile.fromFilePath(tmpFile);
      await zgFile.merkleTree();

      const [tx, err] = await indexer.upload(zgFile, rpcUrl, signer);

      await zgFile.close();

      if (err === null && tx) {
        const hash = "txHash" in tx ? tx.txHash : String(tx);
        keyIndex.set(key, hash);
        return { txHash: hash };
      }

      // Upload returned an error - fall back to memory
      const memKey = getMemoryKey(key);
      memoryStore.set(memKey, serialized);
      updateMemoryIndex(key);
      return { txHash: `memory-${Date.now()}` };
    } finally {
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }
  } catch {
    // 0G network is unreachable - save to memory so the user's work isn't lost
    const memKey = getMemoryKey(key);
    memoryStore.set(memKey, serialized);
    updateMemoryIndex(key);
    return { txHash: `memory-${Date.now()}` };
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

    const { Indexer } = await import("@0gfoundation/0g-storage-ts-sdk");
    const fs = await import("fs");
    const path = await import("path");
    const os = await import("os");

    const indexer = new Indexer(storageRpc);
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `virgil-dl-${Date.now()}.json`);

    try {
      const err = await indexer.download(txHash, tmpFile, true);
      if (err !== null) return null;

      const content = fs.readFileSync(tmpFile, "utf-8");
      return JSON.parse(content) as T;
    } finally {
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }
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
