import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

    const uploadResult = await fileManager.uploadFile(
      `${mediaPath}/jetpack.jpg`,
      {
        mimeType: "image/jpeg",
        displayName: "Jetpack drawing",
      }
    );
    // View the response.
    console.log(
      `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
    );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      "Tell me about this image.",
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
