const ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api";

function getApiKey(): string {
  const key = process.env.ETHERSCAN_API_KEY;
  if (!key) {
    throw new Error("ETHERSCAN_API_KEY is not configured");
  }
  return key;
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
  
  const promises = SUPPORTED_CHAINS.map(async (chainId) => {
    const url = `${ETHERSCAN_API_URL}?chainid=${chainId}&module=account&action=balance&address=${address}&tag=latest&apikey=${key}`;
    const res = await fetch(url);
    const data = (await res.json()) as { result: string; status: string; message: string };
    if (data.status !== "1") throw new Error(`Chain ${chainId} failed`);
    return BigInt(data.result || "0");
  });

  const results = await Promise.allSettled(promises);
  
  // Sum up balances across all chains where the request succeeded
  let totalWei = 0n;
  for (const result of results) {
    if (result.status === "fulfilled") {
      totalWei += result.value;
    }
  }

  return totalWei.toString();
}

export async function getTransactions(
  address: string,
  limit = 10
): Promise<unknown[]> {
  const key = getApiKey();
  
  const promises = SUPPORTED_CHAINS.map(async (chainId) => {
    const url = `${ETHERSCAN_API_URL}?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${key}`;
    const res = await fetch(url);
    const data = (await res.json()) as { result: unknown[] | string; status: string; message: string };
    if (data.status !== "1" || !Array.isArray(data.result)) return [];
    
    // Add chainId context to each transaction
    return data.result.map(tx => ({ ...tx, chainId }));
  });

  const results = await Promise.allSettled(promises);
  
  let allTxs: unknown[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allTxs = [...allTxs, ...result.value];
    }
  }

  // Sort by timestamp descending
  allTxs.sort((a: any, b: any) => Number(b.timeStamp || 0) - Number(a.timeStamp || 0));
  
  return allTxs.slice(0, limit);
}

export async function getTokenTransfers(
  address: string,
  contractAddress?: string,
  limit = 10
): Promise<unknown[]> {
  const key = getApiKey();
  
  const promises = SUPPORTED_CHAINS.map(async (chainId) => {
    let url = `${ETHERSCAN_API_URL}?chainid=${chainId}&module=account&action=tokentx&address=${address}&sort=desc&apikey=${key}`;
    if (contractAddress) {
      url += `&contractaddress=${contractAddress}`;
    }
    const res = await fetch(url);
    const data = (await res.json()) as { result: unknown[] | string; status: string; message: string };
    if (data.status !== "1" || !Array.isArray(data.result)) return [];
    
    return data.result.map(tx => ({ ...tx, chainId }));
  });

  const results = await Promise.allSettled(promises);
  
  let allTransfers: unknown[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allTransfers = [...allTransfers, ...result.value];
    }
  }

  // Sort by timestamp descending
  allTransfers.sort((a: any, b: any) => Number(b.timeStamp || 0) - Number(a.timeStamp || 0));
  
  return allTransfers.slice(0, limit);
}
