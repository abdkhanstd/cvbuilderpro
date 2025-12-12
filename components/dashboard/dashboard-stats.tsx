import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Download, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  userId: string;
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const [cvCount, totalViews, totalDownloads, recentActivity] = await Promise.all([
    prisma.cV.count({
      where: {
        userId,
        isDeleted: false,
      },
    }),
    prisma.cV.aggregate({
      where: {
        userId,
        isDeleted: false,
      },
      _sum: {
        viewCount: true,
      },
    }),
    prisma.cV.aggregate({
      where: {
        userId,
        isDeleted: false,
      },
      _sum: {
        downloadCount: true,
      },
    }),
    prisma.userActivity.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
  ]);

  const stats = [
    {
      title: "Total CVs",
      value: cvCount,
      icon: FileText,
      description: "Active CV documents",
    },
    {
      title: "Total Views",
      value: totalViews._sum.viewCount || 0,
      icon: Eye,
      description: "All time views",
    },
    {
      title: "Downloads",
      value: totalDownloads._sum.downloadCount || 0,
      icon: Download,
      description: "Total downloads",
    },
    {
      title: "Recent Activity",
      value: recentActivity,
      icon: TrendingUp,
      description: "Last 7 days",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
