"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Image from "next/image";

import { authService } from "@/service/auth.service";
import { toast } from "react-toastify";
import { User } from "@/types/api";

export const columns: (onRefresh: () => void) => ColumnDef<User>[] = (onRefresh) => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        checked={row.getIsSelected()}
      />
    ),
  },
  {
    accessorKey: "avatarUrl",
    header: "Ảnh đại diện",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="w-9 h-9 relative">
          <Image
            src={user.avatarUrl ? (user.avatarUrl.startsWith("http") ? user.avatarUrl : `http://localhost:5015${user.avatarUrl}`) : "/users/1.png"}
            alt={user.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Người dùng",
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Phân quyền",
    cell: ({ row }) => {
      const role = row.getValue("role");

      return (
        <div
          className={cn(
            `p-1 px-2 rounded-md w-max text-xs font-semibold`,
            role === "Admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
          )}
        >
          {role as string}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span>{date.toLocaleDateString("vi-VN")}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const isAdmin = user.role === "Admin";

      const handleToggleRole = async () => {
        try {
          const newRole = isAdmin ? "User" : "Admin";
          await authService.updateUserRole(user.id, newRole);
          toast.success(`Đã cập nhật quyền thành ${newRole}`);
          onRefresh();
        } catch (error) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || "Lỗi cập nhật quyền");
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Sao chép ID người dùng
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleToggleRole}
            >
              {isAdmin ? "Giáng quyền (User)" : "Thăng quyền (Admin)"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
