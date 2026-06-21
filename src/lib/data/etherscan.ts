const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

function getApiKey(): string {
  const key = process.env.ETHERSCAN_API_KEY;
  if (!key) {
    throw new Error("ETHERSCAN_API_KEY is not configured");
  }
  return key;
}

export async function getETHBalance(address: string): Promise<string> {
  const key = getApiKey();
  const url = `${ETHERSCAN_API_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${key}`;

  const res = await fetch(url);
  const data = (await res.json()) as { result: string; status: string };

  if (data.status !== "1") {
    throw new Error(`Etherscan error: ${data.result}`);
  }

  return data.result;
}

export async function getTransactions(
  address: string,
  limit = 10
): Promise<unknown[]> {
  const key = getApiKey();
  const url = `${ETHERSCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${key}`;

  const res = await fetch(url);
  const data = (await res.json()) as { result: unknown[] | string; status: string };

  if (data.status !== "1") {
    return [];
  }

  return Array.isArray(data.result) ? data.result.slice(0, limit) : [];
}

export async function getTokenTransfers(
  address: string,
  contractAddress?: string,
  limit = 10
): Promise<unknown[]> {
  const key = getApiKey();
  let url = `${ETHERSCAN_API_URL}?module=account&action=tokentx&address=${address}&sort=desc&apikey=${key}`;
  if (contractAddress) {
    url += `&contractaddress=${contractAddress}`;
  }

  const res = await fetch(url);
  const data = (await res.json()) as { result: unknown[] | string; status: string };

  if (data.status !== "1") {
    return [];
  }

  return Array.isArray(data.result) ? data.result.slice(0, limit) : [];
}
