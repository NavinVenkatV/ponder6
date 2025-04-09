import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/auth.config";
// Check if API key is available
const ai = new GoogleGenAI({ apiKey: process.env.API_URL });


//PREV CHAT ENDPOINT IS WORKING AS EXPECTED ==> 9-4
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    // console.log(JSON.stringify(session))

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        });

        if (!existingUser?.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const existingChats = await prisma.chat.findMany({
            where: { userId: existingUser.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        const latestTenChats  = existingChats.reverse(); // getting last latest 10 messages

        if (latestTenChats.length > 0) {
            return NextResponse.json({
                message: "Chats retrieved successfully",
                chats: latestTenChats
            });
        } else {
            return NextResponse.json({
                message: "No existing chats found",
                chats: []
            });
        }
    } catch (e) {
        console.log("Error fetching chats ", e);
        return NextResponse.json({
            error: "Failed to fetch chats",
            details: e instanceof Error ? e.message : "Unknown error"
        }, { status: 500 });
    }
}