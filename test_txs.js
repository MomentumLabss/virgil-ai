const ALCHEMY_KEY = "iE7gg2_53XfzahXwo87vT";
const address = "0xC94eBB328aC25b95DB0E0AA968371885Fa516215";
const url = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;

async function testTxs() {
  const [resIn, resOut] = await Promise.all([
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "alchemy_getAssetTransfers",
        params: [{ fromBlock: "0x0", toBlock: "latest", toAddress: address, category: ["external", "erc20"], withMetadata: true, maxCount: "0xa", order: "desc" }]
      })
    }),
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 2, method: "alchemy_getAssetTransfers",
        params: [{ fromBlock: "0x0", toBlock: "latest", fromAddress: address, category: ["external", "erc20"], withMetadata: true, maxCount: "0xa", order: "desc" }]
      })
    })
  ]);

  const dataIn = await resIn.json();
  const dataOut = await resOut.json();

  let allTxs = [];
  if (dataIn.result?.transfers) allTxs = [...allTxs, ...dataIn.result.transfers];
  if (dataOut.result?.transfers) allTxs = [...allTxs, ...dataOut.result.transfers];

  allTxs.sort((a, b) => Number(b.blockNum || 0) - Number(a.blockNum || 0));
  
  const formattedTxs = allTxs.slice(0, 5).map(tx => ({
    hash: tx.hash,
    timestamp: tx.metadata?.blockTimestamp || "Unknown Time",
  }));

  console.log(JSON.stringify(formattedTxs, null, 2));
}

testTxs();
