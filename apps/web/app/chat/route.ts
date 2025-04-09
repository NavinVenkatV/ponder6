import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/auth.config";

// API KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_URL });

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { prompt, chatHistory } = await req.json();
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", chatHistory)
    
    try {
        if (!process.env.API_URL) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        });

        if (!user?.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Store user message in database
        await prisma.chat.create({
            data: {
                userId: user.id,
                role: "user",
                message: prompt
            }
        });

        // Build conversation context
        let conversationContext = "";
        if (chatHistory && chatHistory.length > 0) {
            conversationContext = chatHistory.map((msg: any) => 
                `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.message}`
            ).join("\n\n");
        }

        const structuredPrompt = `
        You are an expert project mentor and planner. Engage in a natural conversation about the project idea.
        
        ${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}
        
        User's latest message: "${prompt}"
        
        First, provide a brief, encouraging response to the user's idea. Then, if the idea is clear enough, create a project plan.
        If more details are needed, ask relevant questions to better understand their vision.
        
        If you have enough information to create a plan, respond in this JSON format:
        {
          "conversation": {
            "response": "Your encouraging response here",
            "needsMoreInfo": false,
            "questions": []
          },
          "plan": {
            "title": "Project title",
            "totalWeeks": 4,
            "weeks": [
              {
                "weekNumber": 1,
                "title": "Week title",
                "goals": ["goal 1", "goal 2"],
                "resources": ["resource 1"]
              }
            ]
          }
        }
        
        If you need more information, respond in this format:
        {
          "conversation": {
            "response": "Your encouraging response here",
            "needsMoreInfo": true,
            "questions": ["What is your target audience?", "What features do you want to include?"]
          },
          "plan": null
        }
        
        Keep the conversation natural and encouraging. Focus on understanding their vision before creating a plan.
        `;
        
        console.log("Sending prompt to Gemini:", structuredPrompt);
        
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: structuredPrompt
        });
        console.log("AI RESPONSE      XXXXXXXXXXXXXXXXXX", response);

        console.log("Raw Gemini response:", response);

        if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error("No text in Gemini response:", response);
            throw new Error("Failed to get response from Gemini API");
        }

        const rawOutput = response.candidates[0].content.parts[0].text;
        console.log("Raw output from Gemini:", rawOutput);
        
        // Parse the JSON response
        let parsed;
        try {
            // Try to clean the response if it contains markdown code blocks
            const cleanedOutput = rawOutput.replace(/```json\n?|\n?```/g, '').trim();
            console.log("Cleaned output:", cleanedOutput);
            
            parsed = JSON.parse(cleanedOutput);
            console.log("Parsed JSON:", parsed);
            
            // Validate the structure
            if (!parsed.conversation || typeof parsed.conversation !== 'object') {
                throw new Error("Response missing 'conversation' object");
            }
            
            if (!parsed.conversation.response || typeof parsed.conversation.response !== 'string') {
                throw new Error("Response missing 'conversation.response' string");
            }
            
            if (parsed.plan !== null && (!parsed.plan || typeof parsed.plan !== 'object')) {
                throw new Error("Invalid 'plan' object");
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

        // Store AI response in database
        await prisma.chat.create({
            data: {
                userId: user.id,
                role: "ai",
                message: parsed.conversation.response
            }
        });

        // If we have a plan, create a project and tasks
        if (parsed.plan) {
            const project = await prisma.project.create({
                data: {
                    title: parsed.plan.title || prompt,
                    userId: user.id
                }
            });

            // const task = await prisma.task.create({
            //     where : {
            //         projectId : project.id
            //     },
            //     data : {
            //         title : parsed.plan.title,
            //         description : parsed.plan
            //     }
            // })

            // Note: Task creation is commented out as the Task model is not available in the schema
            // If you want to create tasks, you'll need to uncomment the Task model in your Prisma schema

            return NextResponse.json({
                message: "Project created successfully",
                projectId: project.id,
                conversation: parsed.conversation,
                plan: parsed.plan
            });
        }

        // If no plan yet, just return the conversation
        return NextResponse.json({
            message: "Conversation continued",
            conversation: parsed.conversation,
            plan: null
        });
    } catch (e) {
        console.log(e);
        return NextResponse.json({
            error: "Something went wrong"
        }, { status: 500 });
    }
}

