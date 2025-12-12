"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Home, Settings, LogOut, Plus, Sparkles } from "lucide-react";

interface DashboardHeaderProps {
  user?: {
    name?: string | null;
    email?: string;
    image?: string | null;
    role?: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();

  // Provide default values if user is undefined
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userImage = user?.image || undefined;
  const userRole = user?.role;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CV Builder Pro</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className={`text-sm hover:text-primary transition-colors ${
                pathname === "/dashboard" ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              <Home className="h-4 w-4 inline mr-1" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/cvs"
              className={`text-sm hover:text-primary transition-colors ${
                pathname.startsWith("/dashboard/cvs") ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              <FileText className="h-4 w-4 inline mr-1" />
              My CVs
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/dashboard/cvs/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New CV
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings & Profile
                </Link>
              </DropdownMenuItem>
              {userRole === "ADMIN" && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/admin/settings" className="cursor-pointer">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Admin settings
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
