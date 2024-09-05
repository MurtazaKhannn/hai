import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const saltRounds = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username , confirmpassword } = body;

    if (!email || !password || !username || !confirmpassword) {
      return new Response(
        JSON.stringify({ message: "Missing email, password, confirmpassword or username" }),
        { status: 400 }
      );
    }

    if (password !== confirmpassword) {
      return new Response(
        JSON.stringify({ message: "Passwords do not match" }),
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "User already exists" }),
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        username: username,
      },
    });

    return NextResponse.json({ message : "User created" , newUser});
  } catch (error: any) {
    console.error("Error in POST request:", error);
    return new Response(
      JSON.stringify({ message: "Error processing request" }),
      { status: 500 }
    );
  }
}
