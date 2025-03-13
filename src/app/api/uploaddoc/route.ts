import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs/promises'; 
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File; 

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer()); 
    const uploadsDir = path.join(process.cwd(), 'public/uploads'); 
    const filePath = path.join(uploadsDir, file.name);

    await fs.writeFile(filePath, new Uint8Array(fileBuffer));
    console.log(`File saved locally at: ${filePath}`);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "application/pdf",
      displayName: file.name,
    });

    console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

    const getResponse = await fileManager.getFile(uploadResponse.file.name);

    console.log(`Retrieved file ${getResponse.displayName} as ${getResponse.uri}`);

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: "Can you summarize this document as a bulleted list?" },
    ]);

    console.log(result.response.text());

    await fs.unlink(filePath);
    console.log(`File deleted from local system: ${filePath}`);
    console.log(result.response.text());
    

    return NextResponse.json({ message : result.response.text() , status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Error making API request", details: error.message }, { status: 500 });
  }
}
