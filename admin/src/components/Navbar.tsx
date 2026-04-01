/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { useRouter } from "next/navigation";
import { authService } from "@/service/auth.service";
import { useEffect, useState } from "react";
import { User as ApiUser } from "@/types/api";

const Navbar = () => {
  const { setTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    authService.getProfile().then(res => {
      setUser(res.data?.data || res.data);
    }).catch(err => console.error("Failed to fetch user in Navbar", err));
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/login");
    }
  };

  return (
    <nav className="p-4 flex items-center justify-between sticky top-0 bg-background z-10">
      {/* LEFT */}
      <SidebarTrigger />
      {/* <Button variant="outline" onClick={toggleSidebar}>
        Custom Button
      </Button> */}
      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Link href="/">Bảng điều khiển</Link>
        {/* THEME MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Chuyển giao diện</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Sáng
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Tối
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              Hệ thống
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* USER MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage 
                src={user?.avatarUrl ? (user.avatarUrl.startsWith("http") ? user.avatarUrl : `http://localhost:5015${user.avatarUrl}`) : "/users/1.png"} 
                className="object-cover"
              />
              <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "CN"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                Hồ sơ
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
              <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
