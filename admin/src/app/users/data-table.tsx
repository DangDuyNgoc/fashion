"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/TablePagination";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/service/auth.service";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRefresh?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRefresh,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const ids = selectedRows.map((row) => (row.original as { id: string }).id);
      
      await Promise.all(ids.map((id) => authService.deleteUser(id)));
      
      toast.success(`Đã xóa ${ids.length} người dùng!`);
      setRowSelection({});
      setShowDeleteModal(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error("Lỗi khi xóa người dùng!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-md border relative">
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-md shadow-lg max-w-sm w-full border">
            <h2 className="text-lg font-semibold mb-2">Xác nhận xóa</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Bạn có chắc chắn muốn xóa {table.getFilteredSelectedRowModel().rows.length} người dùng đã chọn? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Hủy</Button>
              <Button variant="destructive" onClick={handleBulkDelete} disabled={isDeleting}>
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex justify-end">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 text-sm rounded-md m-4 cursor-pointer hover:bg-red-600 transition"
          >
            <Trash2 className="w-4 h-4"/>
            Xóa người dùng đã chọn ({Object.keys(rowSelection).length})
          </button>
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
