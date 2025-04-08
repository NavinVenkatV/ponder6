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

        // Build structured prompt
        const structuredPrompt = `
        You are an expert project planner.

        Based on the following project idea: "${prompt}", create a 4-week schedule.

        Each week should include:
        - Week number
        - A title
        - 2 to 3 goals (as short bullet points)
        - Optional resources (e.g., docs or tutorials)

        Respond only in this JSON format:
        {
          "weeks": [
            {
              "week": 1,
              "title": "Title here",
              "goals": ["goal 1", "goal 2", "goal 3"],
              "resources": ["resource 1", "resource 2"]
            },
            {
              "week": 2,
              "title": "Another title",
              "goals": ["goal 1", "goal 2"],
              "resources": []
            }
          ]
        }

        Only respond in valid JSON. Do not include explanations or extra text.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: structuredPrompt
        });

        if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("Failed to get response from Gemini API");
        }

        const rawOutput = response.candidates[0].content.parts[0].text;
        console.log("Raw Gemini response:", rawOutput);
        
        // Parse the JSON response
        let parsed;
        try {
            // Try to clean the response if it contains markdown code blocks
            const cleanedOutput = rawOutput.replace(/```json\n?|\n?```/g, '').trim();
            parsed = JSON.parse(cleanedOutput);
            
            // Validate the structure
            if (!parsed.weeks || !Array.isArray(parsed.weeks)) {
                throw new Error("Response missing 'weeks' array");
            }
            
            // Validate each week has required fields
            for (const week of parsed.weeks) {
                if (!week.week || !week.title || !Array.isArray(week.goals)) {
                    throw new Error("Week missing required fields");
                }
            }
        } catch (err: any) {
            console.error("Failed to parse Gemini response:", err);
            console.error("Raw response:", rawOutput);
            return NextResponse.json({ 
                error: "Invalid AI response format",
                details: err.message,
                rawResponse: rawOutput
            }, { status: 500 });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        });

        if (!user?.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const project = await prisma.project.create({
            data: {
                title: prompt,
                userId: user.id
            }
        });

        // Create tasks for each goal
        for (const week of parsed.weeks) {
            for (const goal of week.goals) {
                await prisma.task.create({
                    data: {
                        title: goal,
                        description: `Week ${week.week}: ${week.title}`,
                        projectId: project.id
                    }
                });
            }
        }

        return NextResponse.json({
            message: "Project and tasks created successfully",
            projectId: project.id,
            plan: parsed
        });
    } catch (e) {
        console.log(e);
        return NextResponse.json({
            error: "Something went wrong"
        }, { status: 500 });
    }
}

