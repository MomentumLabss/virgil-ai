import { config } from 'dotenv';
config({ path: '.env.local' });
import { writeToOG } from './src/lib/0g/storage';
import { evaluateCondition } from './src/lib/ai/evaluate';
import { computeRecordHash } from './src/lib/crypto/hash';
import { getETHBalance } from './src/lib/data/etherscan';
import { randomUUID } from 'crypto';
import { formatEther } from 'ethers';

async function run() {
  const instructionId = randomUUID();
  const walletAddress = '0x8742B16258D508935dc2c245ec2335E3851943Fd';
  
  const instruction = {
    id: instructionId,
    walletAddress,
    raw: 'Alert me if wallet 0x8742B16258D508935dc2c245ec2335E3851943Fd has more than 0.01 ETH',
    parsed: {
      raw: 'Alert me if wallet 0x8742B16258D508935dc2c245ec2335E3851943Fd has more than 0.01 ETH',
      conditionType: 'wallet_movement',
      target: '0x8742B16258D508935dc2c245ec2335E3851943Fd',
      threshold: 0.01,
      thresholdUnit: 'ETH',
      action: 'Alert me'
    },
    status: 'active',
    createdAt: Math.floor(Date.now() / 1000),
    ogStorageKey: `instructions/${walletAddress}/${instructionId}`,
    ogTxHash: null
  };
  
  console.log('--------------------------------------------------');
  console.log('🤖 AGENT EVALUATION TEST INITIATED');
  console.log('--------------------------------------------------\n');
  
  console.log('1. INSTRUCTION LOADED:');
  console.log(`   "${instruction.raw}"\n`);

  console.log('2. FETCHING LIVE DATA FROM BLOCKCHAIN (Etherscan Multi-Chain)...');
  const weiBalance = await getETHBalance(walletAddress);
  const ethBalance = formatEther(weiBalance);
  console.log(`   Observed Balance: ${ethBalance} ETH\n`);
  
  const realTimeData = { balance: ethBalance, recentTransactions: [] };
  
  console.log('3. PROCESSING VIA GROQ LPU (llama-3.3-70b-versatile)...');
  // @ts-ignore
  const evalResult = await evaluateCondition(instruction.parsed, realTimeData);
  
  console.log('   [LPU OUTPUT]');
  console.log(`   Outcome:   ${evalResult.outcome}`);
  console.log(`   Reasoning: ${evalResult.reasoning}`);
  console.log(`   Action:    ${evalResult.actionTaken}\n`);
  
  const timestamp = Math.floor(Date.now() / 1000);
  const recordId = randomUUID();
  const recordBase = {
    instructionId,
    walletAddress,
    conditionChecked: instruction.raw,
    dataObserved: realTimeData,
    outcome: evalResult.outcome,
    reasoning: evalResult.reasoning,
    actionTaken: evalResult.actionTaken,
    timestamp,
  };
  
  const recordHash = computeRecordHash(recordBase);
  
  const record = {
    id: recordId,
    ...recordBase,
    recordHash,
    ogStorageKey: `records/${instructionId}/${timestamp}`,
    ogTxHash: null,
    verificationUrl: `https://virgil-ai-one.vercel.app/verify/${recordId}`
  };
  
  console.log('4. SECURING DECISION TO 0G NETWORK...');
  console.log(`   Generated Cryptographic Hash: ${recordHash}`);
  
  // Actually writing to 0G in memory for this test since we don't have keys in env
  // @ts-ignore
  const ogResult = await writeToOG(record.ogStorageKey, record);
  console.log(`   0G Tx Hash: ${ogResult.txHash}\n`);
  
  console.log('--------------------------------------------------');
  console.log('✅ TEST COMPLETE. VERIFICATION LINK GENERATED:');
  console.log(record.verificationUrl);
  console.log('--------------------------------------------------');
}

run().catch(console.error);
