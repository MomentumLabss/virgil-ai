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

const TOOLS = [
  {
    type: "function",
    function: {
      name: "getETHBalance",
      description: "Fetches the current ETH balance for a specific wallet address across multiple networks. Returns the total balance in Wei.",
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
          limit: { type: "number", description: "Number of transactions to fetch (default 10)" }
        },
        required: ["address"]
      }
    }
  }
];

export async function* streamCopilotResponse(
  messages: CopilotMessage[],
  instructions: Instruction[],
  recentRecords: AgentRecord[]
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
            const balanceWei = await getETHBalance(args.address);
            formattedMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "getETHBalance",
              content: `Balance in Wei: ${balanceWei} (Note: 1 ETH = 10^18 Wei)`
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
            const txs = await getTransactions(args.address, args.limit || 5);
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
