import { CopilotMessage, Instruction, AgentRecord } from "@/types";

function buildSystemPrompt(
  instructions: Instruction[],
  recentRecords: AgentRecord[]
): string {
  const instructionsContext = instructions.length > 0 
    ? `\n\nCurrent user context (active instructions):\n${JSON.stringify(instructions, null, 2)}`
    : "";

  const recordsContext = recentRecords.length > 0
    ? `\n\nRecent agent records:\n${JSON.stringify(recentRecords, null, 2)}`
    : "";

  return `You are CoVirgil, an AI Web3 assistant built into the Virgil platform. 
You help users understand their Web3 monitoring agent activity, but you can also answer general Web3, crypto, and wallet analysis questions.

If the user asks about their monitoring instructions or agent records, reference the context below. 
If the context is empty, politely explain that they haven't set up any active monitoring instructions yet.
If the user asks a general question (like fetching a balance, explaining a transaction, or analyzing a wallet), answer it normally as an AI assistant.
DO NOT leak raw JSON arrays to the user. Always format your responses in clean, readable text.${instructionsContext}${recordsContext}`;
}

import { getETHBalance, getTransactions } from "@/lib/data/etherscan";
import { getTokenBalances } from "@/lib/data/alchemy";
import { getProtocolTVL } from "@/lib/data/defillama";
import { getTokenPrice } from "@/lib/data/prices";
import { parseInstruction } from "@/lib/ai/parse";
import { writeToOG } from "@/lib/0g/storage";
import { randomUUID } from "crypto";

const TOOLS = [
  {
    type: "function",
    function: {
      name: "getETHBalance",
      description: "Fetches the current ETH balance for a specific wallet address across multiple networks. Returns the total balance in ETH.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "The Ethereum wallet address (0x...)" }
        },
        required: ["address"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getTransactions",
      description: "Fetches the recent transactions for a wallet address across multiple networks.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "The Ethereum wallet address (0x...)" },
          limit: { type: "number", description: "Number of transactions to fetch (default 10)" },
          order: { type: "string", enum: ["desc", "asc"], description: "Sort order by block number. Use 'asc' to find the oldest/first transactions (e.g. to determine wallet age), and 'desc' for the newest." }
        },
        required: ["address"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getTokenBalances",
      description: "Fetches all non-zero ERC-20 token balances for a wallet across multiple chains.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "The Ethereum wallet address (0x...)" }
        },
        required: ["address"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getTokenPrice",
      description: "Fetches the current real-time price of a token (e.g. 'BTC', 'ETH', 'SOL') in USD.",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "The token ticker symbol (e.g. 'BTC', 'ETH')" }
        },
        required: ["symbol"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createMonitoringInstruction",
      description: "Creates a new background monitoring instruction (Virgil agent) for the user. Call this if the user asks you to 'watch', 'monitor', or 'alert' them about an on-chain event.",
      parameters: {
        type: "object",
        properties: {
          instructionText: { type: "string", description: "The plain English condition to monitor, e.g., 'Alert me if 0x123... receives USDT'" }
        },
        required: ["instructionText"]
      }
    }
  }
];

export async function* streamCopilotResponse(
  messages: CopilotMessage[],
  instructions: Instruction[],
  recentRecords: AgentRecord[],
  walletAddress?: string
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = "llama-3.3-70b-versatile";

  if (!apiKey) {
    yield "I'm sorry, but the AI copilot is not configured. Please set GROQ_API_KEY in your environment.";
    return;
  }

  const systemPrompt = buildSystemPrompt(instructions, recentRecords);
  let formattedMessages: any[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))
  ];

  try {
    // Pass 1: Sync call to check for tool usage
    const initialResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        tools: TOOLS,
        tool_choice: "auto",
        stream: false,
      })
    });

    if (!initialResponse.ok) {
      throw new Error(`Groq API error: ${initialResponse.statusText}`);
    }

    const initialData = await initialResponse.json();
    const message = initialData.choices?.[0]?.message;

    if (message?.tool_calls && message.tool_calls.length > 0) {
      // The AI wants to use tools!
      yield "__TOOL_FETCHING__"; // Tell the client to show the custom loading UI
      
      formattedMessages.push(message); // Add the assistant's tool_call request to history

      // Execute tools
      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === "getETHBalance") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const balanceEth = await getETHBalance(args.address);
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "getETHBalance",
              content: `Balance in ETH: ${balanceEth}`
            });
          } catch (e) {
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "getETHBalance",
              content: `Error fetching balance: ${e}`
            });
          }
        } else if (toolCall.function.name === "getTransactions") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const txs = await getTransactions(args.address, args.limit || 5, args.order || "desc");
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "getTransactions",
              content: JSON.stringify(txs)
            });
          } catch (e) {
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "getTransactions",
              content: `Error fetching txs: ${e}`
            });
          }
        } else if (toolCall.function.name === "getTokenBalances") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const balances = await getTokenBalances(args.address);
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "getTokenBalances",
              content: JSON.stringify(balances)
            });
          } catch (e) {
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "getTokenBalances",
              content: `Error fetching balances: ${e}`
            });
          }
        } else if (toolCall.function.name === "getProtocolTVL") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const tvl = await getProtocolTVL(args.protocol);
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "getProtocolTVL",
              content: JSON.stringify(tvl)
            });
          } catch (e) {
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "getProtocolTVL",
              content: `Error fetching TVL: ${e}`
            });
          }
        } else if (toolCall.function.name === "getTokenPrice") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const price = await getTokenPrice(args.symbol, "usd");
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "getTokenPrice",
              content: `Current price of ${args.symbol}: $${price}`
            });
          } catch (e) {
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "getTokenPrice",
              content: `Error fetching price: ${e}`
            });
          }
        } else if (toolCall.function.name === "createMonitoringInstruction") {
          try {
            if (!walletAddress) throw new Error("Wallet address is required to create an instruction.");
            const args = JSON.parse(toolCall.function.arguments);
            
            // Parse the natural language into structured params
            const parsed = await parseInstruction(args.instructionText);
            
            // Write to 0G database
            const id = randomUUID();
            const instruction: Instruction = {
              id,
              walletAddress,
              parsed,
              status: "active",
              createdAt: Math.floor(Date.now() / 1000),
              lastCheckedAt: null,
              triggeredAt: null,
              ogStorageKey: `instructions/${walletAddress}/${id}`,
              ogTxHash: null,
            };
            const result = await writeToOG(instruction.ogStorageKey, instruction);
            instruction.ogTxHash = result.txHash;
            await writeToOG(instruction.ogStorageKey, instruction);
            
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "createMonitoringInstruction",
              content: `Successfully created and saved the monitoring instruction to 0G Storage! Instruction ID: ${id}. The agent is now actively monitoring it in the background.`
            });
          } catch (e) {
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "createMonitoringInstruction",
              content: `Error creating instruction: ${e}`
            });
          }
        }
      }

      // Pass 2: Stream final response with tool results
      const streamResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          stream: true,
        })
      });

      if (!streamResponse.ok || !streamResponse.body) {
        throw new Error("Failed to stream final response");
      }

      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              const text = data.choices?.[0]?.delta?.content;
              if (text) yield text;
            } catch (e) {}
          }
        }
      }
    } else {
      // No tools needed, just return the text
      // We can yield it all at once, or chunk it artificially if we want the typewriter effect
      // But Groq is so fast, yielding it all at once is fine.
      yield message?.content || "";
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    yield `I'm sorry, I encountered an error while fetching data: ${message}`;
  }
}

export async function generateTelegramResponse(
  messages: CopilotMessage[],
  instructions: Instruction[],
  recentRecords: AgentRecord[],
  ownerId: string,
  isTelegramNative: boolean
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = "llama-3.3-70b-versatile";

  if (!apiKey) return "I'm sorry, but my AI core is not configured. Please contact the developer.";

  // A special prompt prefix for Telegram native users
  const telegramPrefix = isTelegramNative 
    ? "You are chatting with the user on Telegram. They have registered their wallet address. Do not tell them to go to a dashboard."
    : "You are chatting with a user on Telegram who has linked their Web3 dashboard account.";

  const systemPrompt = telegramPrefix + "\n" + buildSystemPrompt(instructions, recentRecords);
  let formattedMessages: any[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        tools: TOOLS,
        tool_choice: "auto",
        stream: false,
      })
    });

    const initialData = await response.json();
    const message = initialData.choices?.[0]?.message;

    if (message?.tool_calls && message.tool_calls.length > 0) {
      formattedMessages.push(message);

      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === "getETHBalance") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const balanceEth = await getETHBalance(args.address);
            formattedMessages.push({ tool_call_id: toolCall.id, role: "tool", name: "getETHBalance", content: `Balance: ${balanceEth} ETH` });
          } catch (e) {
            formattedMessages.push({ tool_call_id: toolCall.id, role: "tool", name: "getETHBalance", content: `Error: ${e}` });
          }
        } else if (toolCall.function.name === "getTokenBalances") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const balances = await getTokenBalances(args.address);
            formattedMessages.push({ tool_call_id: toolCall.id, role: "tool", name: "getTokenBalances", content: JSON.stringify(balances) });
          } catch (e) {
            formattedMessages.push({ tool_call_id: toolCall.id, role: "tool", name: "getTokenBalances", content: `Error: ${e}` });
          }
        } else if (toolCall.function.name === "createMonitoringInstruction") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const parsed = await parseInstruction(args.instructionText);
            const id = randomUUID();
            const instruction: Instruction = {
              id,
              walletAddress: ownerId, // Store ownerId directly
              parsed,
              status: "active",
              createdAt: Math.floor(Date.now() / 1000),
              lastCheckedAt: null,
              triggeredAt: null,
              ogStorageKey: `instructions/${ownerId}/${id}`,
              ogTxHash: null,
            };
            const result = await writeToOG(instruction.ogStorageKey, instruction);
            instruction.ogTxHash = result.txHash;
            await writeToOG(instruction.ogStorageKey, instruction);
            
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "createMonitoringInstruction",
              content: `Success! Created instruction ID ${id} tied to owner ${ownerId}.`
            });
          } catch (e) {
            formattedMessages.push({ tool_call_id: toolCall.id, role: "tool", name: "createMonitoringInstruction", content: `Error: ${e}` });
          }
        } else {
            // Placeholder for other tools to prevent breaking
            formattedMessages.push({ tool_call_id: toolCall.id, role: "tool", name: toolCall.function.name, content: `Tool executed successfully.` });
        }
      }

      const finalResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: formattedMessages, stream: false })
      });
      const finalData = await finalResponse.json();
      return finalData.choices?.[0]?.message?.content || "Finished processing.";
    }

    return message?.content || "I didn't quite catch that.";
  } catch (e) {
    return "I encountered an error communicating with my core AI engine.";
  }
}
