import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { message, history, userId } = reqBody;
    // console.log(userId);

    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    // })

    // if (!user) {
    //   return NextResponse.json({ message: "User not found", status: 400 });
    // }


    // if (!message || !history || !userId) {
    //   return NextResponse.json({ message: "Missing required fields", status: 400 });
    // }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      tools: [
        {
          codeExecution: {},
        },
      ],
    });

    const chatHistory = history.map((entry: any) => ({
      role: entry.type === 'bot' ? 'model' : 'user',
      parts: [{ text: entry.message }],
    }));

    const chat = model.startChat({ history: chatHistory });

    const result = await chat.sendMessage(message);

    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No valid response received";

    // const conversation = await prisma.conversation.findFirst({
    //   where: { userId: userId },
    //   include: { messages: true }
    // });

    // if (!conversation) {
    //   const newConversation = await prisma.conversation.create({
    //     data: {
    //       user: { connect: { id: userId } },
    //       messages: {
    //         create: [
    //           {
    //             content: message,
    //             sender: "USER",
    //           },
    //         ],
    //       },
    //     },
    //   });

      // await prisma.message.create({
      //   data: {
      //     content: responseText,
      //     sender: "BOT",
      //     conversation: { connect: { id: newConversation?.id } }, 
      //   },
      // });

      return NextResponse.json({ message: responseText, status: 200 });

    // await prisma.message.create({
    //   data: {
    //     content: message,
    //     sender: "USER",
    //     conversation: { connect: { id: conversation?.id } }
    //   },
    // })

    // await prisma.message.create({
    //   data: {
    //     content: responseText,
    //     sender:"BOT",
    //     conversation: { connect: { id : conversation.id}}
    //   }
    // })

    // return NextResponse.json({ message: responseText, status: 200 });

  } catch (error: any) {
    console.error("Error:", error.message || error);
    return NextResponse.json({ message: "Error occurred", error: error.message, status: 400 });
  }
}
