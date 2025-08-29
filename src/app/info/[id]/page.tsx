import { prisma } from "@/libs/prisma/prisma";
import Link from "next/link";
import InfoChatClient from "@/components/InfoChat/InfoChatClient";
import Image from "next/image";

type Props = { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ prompt?: string }>;
};

export default async function InfoPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Fetch base project data (avoid including relations that may not be available in runtime client)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const project = await (prisma as any).project.findUnique({
    where: { id: resolvedParams.id },
    select: {
      id: true,
      name: true,
      description: true,
      visibility: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบโปรเจค</h1>
        <p className="text-gray-600">ไม่สามารถค้นหาโปรเจคที่ร้องขอได้</p>
      </div>
    );
  }

  // Fetch related counts and owner info separately to avoid loading large arrays and to be resilient
  const [owner] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any).user.findUnique({
      where: { id: project.userId },
      select: { displayName: true, email: true },
    }),
  ]);

  return (
    <div className="relative w-full min-h-screen">
      <Image
        src="/img/background_home.png"
        alt=""
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute left-4 top-4 z-50">
        <div aria-label="Midori home" className="flex items-center gap-3">
          <Image src="/img/logo.png" alt="Midori" width={56} height={56} />
          <span className="text-black font-semibold leading-none tracking-tight drop-shadow-sm text-base sm:text-lg md:text-2xl">
            Midori
          </span>
        </div>
      </div>
      <div className="absolute inset-0 bg-green-300/50" aria-hidden="true" />
      <div className="relative z-10 p-4">
        <InfoChatClient 
          projectId={project.id} 
          initialPrompt={resolvedSearchParams.prompt || project.description || ""}
        />
      </div>
    </div>
  );
}
