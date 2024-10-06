import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { getToken } from "next-auth/jwt";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        // Manually create a session and token
        const token = await getToken({ req });
        if (token) {
            token.id = user.id;
            token.username = user.username;
        }

        // Create a session for the user
        const session = {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
            expires: new Date(Date.now() + 60 * 60 * 1000), // Session expires in 1 hour
        };

        // Return success response with session
        return NextResponse.json({ message: "Login successful", session });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
