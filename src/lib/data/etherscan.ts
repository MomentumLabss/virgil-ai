const ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api";

function getApiKey(): string {
  const key = process.env.ETHERSCAN_API_KEY;
  if (!key) {
    throw new Error("ETHERSCAN_API_KEY is not configured");
  }
  return key;
}

async function fetchWithTimeout(url: string, timeoutMs = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

const SUPPORTED_CHAINS = [
  1, // Ethereum Mainnet
  11155111, // Sepolia Testnet
  17000, // Holesky Testnet
  10, // Optimism
  42161, // Arbitrum
  8453, // Base
  137, // Polygon
  56, // BSC
];

export async function getETHBalance(address: string): Promise<string> {
  const key = getApiKey();
  let totalWei = 0n;

  for (const chainId of SUPPORTED_CHAINS) {
    try {
      const url = `${ETHERSCAN_API_URL}?chainid=${chainId}&module=account&action=balance&address=${address}&tag=latest&apikey=${key}`;
      const res = await fetchWithTimeout(url, 3000);
      const data = (await res.json()) as { result: string; status: string; message: string };
      if (data.status === "1") {
        totalWei += BigInt(data.result || "0");
      }
      // Small delay to prevent rate limit (5 req/sec)
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch {
      // ignore individual chain failures
    }
  }

  return totalWei.toString();
}

export async function getTransactions(
  address: string,
  limit = 10
): Promise<unknown[]> {
  const key = getApiKey();
  let allTxs: unknown[] = [];

  for (const chainId of SUPPORTED_CHAINS) {
    try {
      const url = `${ETHERSCAN_API_URL}?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${key}`;
      const res = await fetchWithTimeout(url, 3000);
      const data = (await res.json()) as { result: unknown[] | string; status: string; message: string };
      if (data.status === "1" && Array.isArray(data.result)) {
        const txsWithChain = data.result.map((tx: any) => ({ ...tx, chainId }));
        allTxs = [...allTxs, ...txsWithChain];
      }
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch {
      // ignore individual failures
    }
  }

  allTxs.sort((a: any, b: any) => Number(b.timeStamp || 0) - Number(a.timeStamp || 0));
  return allTxs.slice(0, limit);
}

export async function getTokenTransfers(
  address: string,
  contractAddress?: string,
  limit = 10
): Promise<unknown[]> {
  const key = getApiKey();
  let allTransfers: unknown[] = [];

  for (const chainId of SUPPORTED_CHAINS) {
    try {
      let url = `${ETHERSCAN_API_URL}?chainid=${chainId}&module=account&action=tokentx&address=${address}&sort=desc&apikey=${key}`;
      if (contractAddress) {
        url += `&contractaddress=${contractAddress}`;
      }
      const res = await fetchWithTimeout(url, 3000);
      const data = (await res.json()) as { result: unknown[] | string; status: string; message: string };
      if (data.status === "1" && Array.isArray(data.result)) {
        const txsWithChain = data.result.map((tx: any) => ({ ...tx, chainId }));
        allTransfers = [...allTransfers, ...txsWithChain];
      }
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch {
      // ignore
    }
  }

  allTransfers.sort((a: any, b: any) => Number(b.timeStamp || 0) - Number(a.timeStamp || 0));
  return allTransfers.slice(0, limit);
}
