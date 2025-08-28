import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, visibility = 'private' } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // หา temporary user หรือสร้างใหม่
    let tempUser = await (prisma as any).user.findFirst({
      where: {
        email: "temp@midori.local"
      }
    });

    if (!tempUser) {
      tempUser = await (prisma as any).user.create({
        data: {
          email: "temp@midori.local",
          displayName: "Temporary User",
        }
      });
    }

    // สร้าง project ใหม่
    const project = await (prisma as any).project.create({
      data: {
        name,
        description,
        visibility,
        userId: tempUser.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const projects = await (prisma as any).project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
