import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/auth.config";
import { prisma } from "@repo/db";

export async function GET() {
    try {
        console.log("before session")
        const session = await getServerSession(authOptions);
        console.log("after session")
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" });
        }

        const project = await prisma.project.findFirst({
            where: { userId: user.id }
        });

        if (!project) {
            return NextResponse.json({ message: "No project found" });
        }

        const tasks = await prisma.task.findMany({
            where: { projectId: project.id }
        });
        

        if (!tasks) {
            return NextResponse.json({ message: "No tasks found" });
        }

        return NextResponse.json({ tasks });
    } catch (error: any) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json({ 
            error: "Failed to fetch tasks",
            details: error.message 
        }, { status: 500 });
    }
}
