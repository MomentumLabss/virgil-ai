import { getETHBalance, getTransactions } from './src/lib/data/etherscan';

async function run() {
  const target = "0x28C6c06298d514Db089934071355E22Af164F04e"; // Binance 14
  console.log("Fetching balance...");
  const balance = await getETHBalance(target);
  console.log("Balance:", balance);

  console.log("Fetching txs...");
  const txs = await getTransactions(target, 5);
  console.log("Txs:", txs.length);
}

run().catch(console.error);
