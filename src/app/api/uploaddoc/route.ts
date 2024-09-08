import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs/promises'; // Using promises version for async/await
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File; // Assuming the file input field name is 'file'.

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer()); // Convert file to a Buffer for file system operations
    const uploadsDir = path.join(process.cwd(), 'uploads'); // Correct path to 'uploads' folder
    const filePath = path.join(uploadsDir, file.name);

    // Save the file to the local file system
    await fs.writeFile(filePath, fileBuffer);
    console.log(`File saved locally at: ${filePath}`);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

    // Assuming you need to upload the local file after saving
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "application/pdf",
      displayName: file.name,
    });

    console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

    // Get the previously uploaded file's metadata
    const getResponse = await fileManager.getFile(uploadResponse.file.name);

    console.log(`Retrieved file ${getResponse.displayName} as ${getResponse.uri}`);

    // Call Google API to summarize document
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: "Can you summarize this document as a bulleted list?" },
    ]);

    // Output the generated text to the console
    console.log(result.response.text());

    // Optionally delete the file after processing if needed
    await fs.unlink(filePath);
    console.log(`File deleted from local system: ${filePath}`);

    return NextResponse.json({ result, status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Error making API request", details: error.message }, { status: 500 });
  }
}
