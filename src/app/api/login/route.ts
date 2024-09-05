import { NextRequest , NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();


export async function POST(req : NextRequest) {
    try {

        const body = await req.json();

        const { email , password } = body;
        if(!email || !password){
            return NextResponse.json({message : "Invalid email or password"} , {status : 400});
        }
        
        const user = await prisma.user.findUnique({
            where:{
                email : email
            }
        });

        if(!user){
            return NextResponse.json({message : "User not found"} , { status : 404});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
              { message: "Invalid email or password" },
              { status: 401 }
            );
        }

        return NextResponse.json({message : "User found" , user});
    } catch (error : any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}