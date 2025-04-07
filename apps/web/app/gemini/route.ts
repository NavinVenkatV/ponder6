import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/auth.config";

// Check if API key is available


const ai = new GoogleGenAI({ apiKey: process.env.API_URL });

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    console.log(JSON.stringify(session))
    
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { prompt } = await req.json();
    
    try {
        if (!process.env.API_URL) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        })

        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        })

        if (!user?.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await prisma.project.create({
            data: {
                title: prompt,
                userId: user.id
            }
        })

        return NextResponse.json({
            msg: response.text
        })
    } catch (e) {
        console.log(e)
        return NextResponse.json({
            msg: "Error"
        })
    }
}

