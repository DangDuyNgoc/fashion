"use client";

import { Category } from "@/types/api";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categoriesService } from "@/service/categories.service";
import { toast } from "react-toastify";
import { useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import AddCategory from "@/components/AddCategory";

export const columns: (onRefresh: () => void) => ColumnDef<Category>[] = (onRefresh) => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Tên danh mục",
  },
  {
    accessorKey: "description",
    header: "Mô tả",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isOpen, setIsOpen] = useState(false);

      const handleDelete = async () => {
        if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
        try {
          await categoriesService.delete(category.id);
          toast.success("Đã xóa danh mục!");
          onRefresh();
        } catch (error) {
          console.error(error);
          toast.error("Xóa thất bại!");
        }
      };

      return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <SheetTrigger asChild>
                <DropdownMenuItem>Sửa danh mục</DropdownMenuItem>
              </SheetTrigger>
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  handleDelete();
                }} 
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                Xóa danh mục
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isOpen && (
            <AddCategory
              initialData={category}
              onSuccess={() => {
                setIsOpen(false);
                onRefresh();
              }}
            />
          )}
        </Sheet>
      );
    },
  },
];
