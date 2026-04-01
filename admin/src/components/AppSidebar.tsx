/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Home,
  Inbox,
  Calendar,
  Search,
  Settings,
  User2,
  ChevronUp,
  Plus,
  Shirt,
  User,
  ShoppingBasket,
  Layers,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,

  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetTrigger } from "./ui/sheet";
import AddOrder from "./AddOrder";
import AddUser from "./AddUser";
import AddCategory from "./AddCategory";
import AddProduct from "./AddProduct";

const items = [
  {
    title: "Trang chủ",
    url: "/",
    icon: Home,
  },
  // {
  //   title: "Hộp thư",
  //   url: "#",
  //   icon: Inbox,
  // },
  // {
  //   title: "Lịch trình",
  //   url: "#",
  //   icon: Calendar,
  // },
  // {
  //   title: "Tìm kiếm",
  //   url: "#",
  //   icon: Search,
  // },
  // {
  //   title: "Cài đặt",
  //   url: "#",
  //   icon: Settings,
  // },
];

import { useEffect, useState } from "react";
import { authService } from "@/service/auth.service";
import { User as ApiUser } from "@/types/api";

const AppSidebar = () => {
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    authService.getProfile().then(res => {
      setUser(res.data?.data || res.data);
    }).catch(err => console.error("Failed to fetch user in Sidebar", err));
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Image 
                  src={user?.avatarUrl ? (user.avatarUrl.startsWith("http") ? user.avatarUrl : `http://localhost:5015${user.avatarUrl}`) : "/logo.svg"} 
                  alt="logo" 
                  width={28} 
                  height={28} 
                  className="rounded-full object-cover w-7 h-7"
                />
                <span className="font-semibold text-lg">{user?.name || "Lama Dev"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Ứng dụng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.title === "Inbox" && (
                    <SidebarMenuBadge>24</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Sản phẩm</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Thêm sản phẩm</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/products">
                    <Shirt />
                    Xem tất cả sản phẩm
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Sheet>
                    <SheetTrigger asChild>
                      <SidebarMenuButton asChild>
                        <Link href="#">
                          <Plus />
                          Thêm sản phẩm
                        </Link>
                      </SidebarMenuButton>
                    </SheetTrigger>
                    <AddProduct />
                  </Sheet>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/categories">
                    <Layers />
                    Xem tất cả danh mục
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Sheet>
                    <SheetTrigger asChild>
                      <SidebarMenuButton asChild>
                        <Link href="#">
                          <Plus />
                          Thêm danh mục
                        </Link>
                      </SidebarMenuButton>
                    </SheetTrigger>
                    <AddCategory />
                  </Sheet>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/reviews">
                    <MessageSquare />
                    Quản lý đánh giá
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Người dùng</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Thêm người dùng</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/users">
                    <User />
                    Xem tất cả người dùng
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Sheet>
                    <SheetTrigger asChild>
                      <SidebarMenuButton asChild>
                        <Link href="#">
                          <Plus />
                          Thêm người dùng
                        </Link>
                      </SidebarMenuButton>
                    </SheetTrigger>
                    <AddUser />
                  </Sheet>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Đơn hàng / Thanh toán</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Thêm đơn hàng</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/orders">
                    <ShoppingBasket />
                    Xem tất cả giao dịch
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Sheet>
                    <SheetTrigger asChild>
                      <SidebarMenuButton asChild>
                        <Link href="#">
                          <Plus />
                          Thêm đơn hàng
                        </Link>
                      </SidebarMenuButton>
                    </SheetTrigger>
                    <AddOrder />
                  </Sheet>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
