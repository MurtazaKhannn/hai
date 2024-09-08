import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { message, history } = reqBody;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      tools: [
        {
          codeExecution: {},
        },
      ],
    });
 
    // Map the history to the required format with valid roles
    const chatHistory = history.map((entry: any) => ({
      role: entry.type === 'bot' ? 'model' : 'user',
      parts: [{ text: entry.message }],
    }));

    // Start the chat session
    const chat = model.startChat({ history: chatHistory });

    // Send a message and get the result
    const result = await chat.sendMessage(message);

    // Access the text of the first candidate safely
    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No valid response received";

    return NextResponse.json({ message: responseText, status: 200 });
  } catch (error: any) {
    console.error("Error:", error.message || error);
    return NextResponse.json({ message: "Error occurred", error: error.message, status: 400 });
  }
}
