import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { message, history, userId } = reqBody;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      tools: [
        {
          codeExecution: {},
        },
      ],
    });

    // Ensure the first message is from the user
    const chatHistory = history.map((entry: any, index: number) => ({
      role: index === 0 ? 'user' : entry.type === 'bot' ? 'model' : 'user',
      parts: [{ text: entry.message }],
    }));

    const chat = model.startChat({ history: chatHistory });

    const result = await chat.sendMessage(message);

    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No valid response received";

    return NextResponse.json({ message: responseText, status: 200 });

  } catch (error: any) {
    console.error("Error:", error.message || error);
    return NextResponse.json({ message: "Error occurred", error: error.message, status: 400 });
  }
}