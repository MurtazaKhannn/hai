import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { message, history, userId } = reqBody;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      tools: [{ codeExecution: {} }],
    });

    const systemPrompt = {
      role: "user",
      parts: [{ text: "Write a humorous and overly critical review of these songs, exaggerating their flaws in an extremely sarcastic manner with a mix of English and Hinglish." }],
    };

    const chatHistory = history.map((entry: any, index: number) => ({
      role: index === 0 ? "user" : entry.type === "bot" ? "model" : "user",
      parts: [{ text: entry.message }],
    }));

    const formattedHistory = [systemPrompt, ...chatHistory];

    const chat = model.startChat({ history: formattedHistory });

    const result = await chat.sendMessage(message);

    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No valid response received";

    return new NextResponse(JSON.stringify({ message: responseText, status: 200 }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow all domains (or replace with your frontend URL)
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });

  } catch (error: any) {
    console.error("Error:", error.message || error);
    return new NextResponse(JSON.stringify({ message: "Error occurred", error: error.message, status: 400 }), {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}

// ✅ Handle CORS Preflight Requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
