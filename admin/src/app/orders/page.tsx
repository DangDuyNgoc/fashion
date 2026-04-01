/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ordersService } from "@/service/orders.service";
import { OrderResponse } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "outline";
    case "processing":
      return "secondary";
    case "shipped":
      return "default";
    case "delivered":
      return "default"; // Or define a custom variant in badge.tsx if needed
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "Chờ xử lý";
    case "processing":
      return "Đang xử lý";
    case "shipped":
      return "Đang giao";
    case "delivered":
      return "Đã giao";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersService.getAll();
      setOrders(res.data.data || res.data);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await ordersService.updateStatus(orderId, newStatus);
      toast.success(`Cập nhật trạng thái sang ${getStatusLabel(newStatus)} thành công`);
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Làm mới
        </Button>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-gray-500"
                  >
                    Chưa có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {order.address}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("vi-VN").format(order.totalPrice)} ₫
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Select
                          disabled={
                            updatingId === order.id ||
                            order.status === "Delivered" ||
                            order.status === "Cancelled"
                          }
                          defaultValue={order.status}
                          onValueChange={(val) =>
                            handleStatusChange(order.id, val)
                          }
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
