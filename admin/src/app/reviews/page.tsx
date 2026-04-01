"use client";

import { useEffect, useState } from "react";
import { reviewService } from "@/service/review.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Star, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";

interface Review {
  id: number;
  productId: number;
  productName: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewService.getAll();
      setReviews(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      await reviewService.delete(id);
      toast.success("Đã xóa đánh giá.");
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Xóa đánh giá thất bại.");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý đánh giá</h2>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead className="max-w-[300px]">Bình luận</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  Chưa có đánh giá nào.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">#{review.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <span className="font-semibold">{review.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {review.productName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="text-gray-400 mt-1 shrink-0" />
                      <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
