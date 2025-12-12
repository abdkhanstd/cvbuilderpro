import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CVList } from "@/components/cv/cv-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function CVsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      cvs: {
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: {
              shares: true,
              comments: true,
              exports: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My CVs</h1>
            <p className="mt-2 text-gray-600">
              Manage and organize all your CVs in one place
            </p>
          </div>
          <Link href="/dashboard/cvs/new">
            <Button size="lg" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Create New CV
            </Button>
          </Link>
        </div>

        <CVList cvs={user.cvs} />
      </div>
    </div>
  );
}
