import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { FileText, Calendar, Eye, Download, ExternalLink } from "lucide-react";

interface RecentCVsProps {
  userId: string;
}

export async function RecentCVs({ userId }: RecentCVsProps) {
  const cvs = await prisma.cV.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
    select: {
      id: true,
      title: true,
      template: true,
      category: true,
      viewCount: true,
      downloadCount: true,
      updatedAt: true,
    },
  });

  if (cvs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent CVs</CardTitle>
          <CardDescription>Your recently updated CVs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No CVs yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first CV to get started
            </p>
            <Link href="/dashboard/cvs/new">
              <Button className="mt-4">Create Your First CV</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent CVs</CardTitle>
            <CardDescription>Your recently updated CVs</CardDescription>
          </div>
          <Link href="/dashboard/cvs">
            <Button variant="ghost" size="sm">
              View All
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className="flex items-start justify-between p-4 rounded-lg border hover:border-primary transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <Link href={`/dashboard/cvs/${cv.id}`}>
                    <h4 className="font-semibold hover:text-primary transition-colors">
                      {cv.title}
                    </h4>
                  </Link>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDateTime(cv.updatedAt)}
                  </span>
                  <span className="flex items-center">
                    <Eye className="mr-1 h-3 w-3" />
                    {cv.viewCount} views
                  </span>
                  <span className="flex items-center">
                    <Download className="mr-1 h-3 w-3" />
                    {cv.downloadCount} downloads
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {cv.template}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {cv.category}
                  </span>
                </div>
              </div>
              <Link href={`/dashboard/cvs/${cv.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
