const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || "iE7gg2_53XfzahXwo87vT";

const ALCHEMY_URLS = [
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
];

export async function getETHBalance(address: string): Promise<string> {
  let totalWei = 0n;

  for (const url of ALCHEMY_URLS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [address, "latest"]
        })
      });
      const data = await res.json();
      if (data.result) {
        totalWei += BigInt(data.result);
      }
    } catch {
      // ignore
    }
  }

  return totalWei.toString();
}

export async function getTransactions(
  address: string,
  limit = 10
): Promise<unknown[]> {
  let allTxs: unknown[] = [];

  for (const url of ALCHEMY_URLS) {
    try {
      const [resIn, resOut] = await Promise.all([
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0", id: 1, method: "alchemy_getAssetTransfers",
            params: [{ fromBlock: "0x0", toBlock: "latest", toAddress: address, category: ["external", "erc20"], withMetadata: true, maxCount: "0xa" }]
          })
        }),
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0", id: 1, method: "alchemy_getAssetTransfers",
            params: [{ fromBlock: "0x0", toBlock: "latest", fromAddress: address, category: ["external", "erc20"], withMetadata: true, maxCount: "0xa" }]
          })
        })
      ]);

      const dataIn = await resIn.json();
      const dataOut = await resOut.json();

      if (dataIn.result?.transfers) allTxs = [...allTxs, ...dataIn.result.transfers];
      if (dataOut.result?.transfers) allTxs = [...allTxs, ...dataOut.result.transfers];
    } catch {
      // ignore
    }
  }

  // Sort by blockNum descending (proxy for timestamp)
  allTxs.sort((a: any, b: any) => Number(b.blockNum || 0) - Number(a.blockNum || 0));
  return allTxs.slice(0, limit);
}

export async function getTokenTransfers(
  address: string,
  contractAddress?: string,
  limit = 10
): Promise<unknown[]> {
  let allTransfers: unknown[] = [];

  for (const url of ALCHEMY_URLS) {
    try {
      const params: any = {
        fromBlock: "0x0",
        toBlock: "latest",
        toAddress: address,
        category: ["erc20"],
        withMetadata: true,
        maxCount: "0xa"
      };
      if (contractAddress) {
        params.contractAddresses = [contractAddress];
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getAssetTransfers",
          params: [params]
        })
      });
      const data = await res.json();
      if (data.result?.transfers) {
        allTransfers = [...allTransfers, ...data.result.transfers];
      }
    } catch {
      // ignore
    }
  }

  return allTransfers.slice(0, limit);
}
