import { NextResponse } from "next/server";
import { generateTelegramResponse } from "@/lib/ai/copilot";
import { linkCodes, telegramUsers, listKeysFromOG, readFromOG } from "@/lib/0g/storage";
import { CopilotMessage, Instruction, AgentRecord } from "@/types";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId: string | number, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return;
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.message && body.message.text) {
      const chatId = body.message.chat.id.toString();
      const text = body.message.text.trim();

      // Handle Account Linking Command
      if (text.startsWith("/link ")) {
        const code = text.replace("/link ", "").trim();
        const walletAddress = linkCodes.get(code);

        if (walletAddress) {
          telegramUsers.set(chatId, walletAddress);
          linkCodes.delete(code); // consume the code
          await sendMessage(chatId, `✅ Successfully linked your Web3 Wallet (${walletAddress}) to this Telegram account! You can now chat with CoVirgil here and receive push notifications for your web instructions.`);
        } else {
          await sendMessage(chatId, `❌ Invalid or expired link code. Please generate a new one from your Web Dashboard.`);
        }
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith("/start")) {
        await sendMessage(chatId, `👋 Welcome to Virgil AI!\n\nI am CoVirgil, your autonomous Web3 monitoring agent. \n\nIf you have a Web3 dashboard account, type \`/link <code>\` to connect your wallet.\n\nOtherwise, just reply with your Web3 Wallet Address (0x...) to start native monitoring!`);
        return NextResponse.json({ ok: true });
      }

      // Check if user is linked or native
      let ownerId = telegramUsers.get(chatId);
      let isTelegramNative = false;

      if (!ownerId) {
        // If it looks like an ETH address, treat as a native registration
        if (text.startsWith("0x") && text.length === 42) {
          telegramUsers.set(chatId, text);
          await sendMessage(chatId, `✅ Successfully registered as a Telegram-Native user with wallet ${text}. What would you like me to monitor?`);
          return NextResponse.json({ ok: true });
        } else {
          await sendMessage(chatId, `⚠️ You haven't connected a wallet yet. Please reply with your Web3 Wallet Address (0x...) or use \`/link <code>\` if you have a web dashboard account.`);
          return NextResponse.json({ ok: true });
        }
      } else {
        // The user is linked! Let's process their message via AI
        await sendMessage(chatId, "🤔 Thinking...");

        // Fetch user's instructions and records from 0G for AI context
        const instructionKeys = await listKeysFromOG(`instructions/${ownerId}/`);
        const instructions = (await Promise.all(instructionKeys.map(k => readFromOG<Instruction>(k)))).filter(Boolean) as Instruction[];

        const recordKeys = await listKeysFromOG(`records/${ownerId}/`);
        // Get the 5 most recent records
        const allRecords = (await Promise.all(recordKeys.map(k => readFromOG<AgentRecord>(k)))).filter(Boolean) as AgentRecord[];
        allRecords.sort((a, b) => b.timestamp - a.timestamp);
        const recentRecords = allRecords.slice(0, 5);

        const messages: CopilotMessage[] = [{ role: "user", content: text, timestamp: Date.now() }];
        
        // Ensure ownerId is passed to Copilot so it can tie new instructions to this user!
        const response = await generateTelegramResponse(messages, instructions, recentRecords, ownerId, isTelegramNative);
        
        await sendMessage(chatId, response);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
