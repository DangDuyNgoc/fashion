"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import AddProduct from "@/components/AddProduct";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Product } from "@/types/api";
import Image from "next/image";
import Link from "next/link";

export const columns: (onRefresh: () => void) => ColumnDef<Product>[] = (onRefresh) => [
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
    accessorKey: "image",
    header: "Hình ảnh",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="w-9 h-9 relative bg-secondary rounded-full flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].imageUrl.startsWith("http") ? product.images[0].imageUrl : `http://localhost:5015${product.images[0].imageUrl}`}
              alt={product.name}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No img</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Giá
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("vi-VN").format(price);
      return <div className="font-medium">{formatted} ₫</div>;
    },
  },
  {
    accessorKey: "categoryName",
    header: "Danh mục",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isOpen, setIsOpen] = useState(false);

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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(product.id.toString())}
              >
                Sao chép ID sản phẩm
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/products/${product.id}`}>Xem chi tiết</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <SheetTrigger asChild>
                <DropdownMenuItem>Sửa sản phẩm</DropdownMenuItem>
              </SheetTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          {isOpen && (
            <AddProduct
              initialData={product}
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
