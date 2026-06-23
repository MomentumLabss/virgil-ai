const ALCHEMY_KEY = "iE7gg2_53XfzahXwo87vT";

async function testAlchemy() {
  const url = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
  console.log("Calling URL:", url);
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getBalance",
      params: ["0x28C6c06298d514Db089934071355E22Af164F04e", "latest"]
    })
  });
  
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Alchemy Data:", data);
}

testAlchemy().catch(console.error);
