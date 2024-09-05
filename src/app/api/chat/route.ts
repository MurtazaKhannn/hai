import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqbody = await req.json();
    const { message } = reqbody;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    const result = await model.generateContent(message);
    console.log(result.response.text());

    return NextResponse.json({ message: result.response.text(), status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: "error", status: 400 });
  }
}
