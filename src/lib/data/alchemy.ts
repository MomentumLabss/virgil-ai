const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || "iE7gg2_53XfzahXwo87vT";

const ALCHEMY_URLS = [
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
];

interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

export async function getTokenBalances(address: string): Promise<any[]> {
  const allBalances: any[] = [];

  const promises = ALCHEMY_URLS.map(async (url) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getTokenBalances",
          params: [address, "erc20"]
        })
      });
      const data = await res.json();
      
      if (data.result?.tokenBalances) {
        // Filter out zero balances
        const nonZero = data.result.tokenBalances.filter((b: TokenBalance) => {
          return b.tokenBalance !== "0x0" && b.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000";
        });

        // Limit to top 5 per chain to save time
        const top5 = nonZero.slice(0, 5);
        for (const token of top5) {
          try {
            const metaRes = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "alchemy_getTokenMetadata",
                params: [token.contractAddress]
              })
            });
            const metaData = await metaRes.json();
            if (metaData.result) {
              const decimals = metaData.result.decimals || 18;
              const rawBal = BigInt(token.tokenBalance);
              const formatted = Number(rawBal) / Math.pow(10, decimals);
              
              if (formatted > 0.0001) {
                // Extract chain name from url
                const chainMatch = url.match(/https:\/\/(.*?)\.g\.alchemy/);
                const chainName = chainMatch ? chainMatch[1].replace("-mainnet", "") : "ethereum";
                allBalances.push({
                  chain: chainName,
                  symbol: metaData.result.symbol,
                  name: metaData.result.name,
                  balance: formatted.toFixed(4),
                  contractAddress: token.contractAddress
                });
              }
            }
          } catch {
            // Ignore metadata failure
          }
        }
      }
    } catch {
      // Ignore RPC failure
    }
  });

  await Promise.all(promises);
  return allBalances;
}
