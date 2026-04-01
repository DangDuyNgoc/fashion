"use client"

import { useEffect, useState, useCallback } from "react";
import { reviewService } from "../../service/review.service";
import { orderService } from "../../service/order.service";
import { authService } from "../../service/auth.service";
import { Star, Send, CheckCircle2, Edit2, Trash2, X, Save } from "lucide-react";
import { toast } from "react-toastify";

interface Review {
  id: number;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface OrderItem {
  id: number;
  productId: number;
  isReviewed: boolean;
}

interface Order {
  status: string;
  items: OrderItem[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const ReviewSection = ({ productId }: { productId: number }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibleItem, setEligibleItem] = useState<OrderItem | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Form state (New Review)
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [updating, setUpdating] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await reviewService.getReviewsByProduct(productId);
      setReviews(res.data.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const checkEligibility = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) return;

    try {
      // Get current user profile
      const profRes = await authService.getProfile();
      setCurrentUserId(profRes.data.data.id);

      const res = await orderService.getMyOrders();
      const orders: Order[] = res.data.data;
      
      // Find a delivered order containing this product that hasn't been reviewed
      for (const order of orders) {
        if (order.status === "Delivered") {
          const item = order.items.find(i => i.productId === productId && !i.isReviewed);
          if (item) {
            setEligibleItem(item);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Failed to check eligibility", error);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [fetchReviews, checkEligibility]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibleItem) return;

    if (comment.trim().length < 5) {
      toast.error("Vui lòng nhập ít nhất 5 ký tự");
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.createReview({
        orderItemId: eligibleItem.id,
        rating,
        comment
      });
      
      toast.success("Cảm ơn bạn đã đánh giá!");
      setComment("");
      setRating(5);
      setEligibleItem(null); // Hide form after submission
      fetchReviews(); // Refresh review list
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleSaveEdit = async () => {
    if (!editId) return;

    if (editComment.trim().length < 5) {
      toast.error("Vui lòng nhập ít nhất 5 ký tự");
      return;
    }

    setUpdating(true);
    try {
      await reviewService.updateReview(editId, {
        rating: editRating,
        comment: editComment
      });
      toast.success("Đã cập nhật đánh giá!");
      setEditId(null);
      fetchReviews();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;

    try {
      await reviewService.deleteReview(id);
      toast.success("Đã xóa đánh giá");
      fetchReviews();
      checkEligibility(); // Re-check if user can review again after deletion (if relevant)
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Xóa thất bại");
    }
  };

  if (loading) return <div className="mt-8 animate-pulse text-gray-400">Đang tải đánh giá...</div>;

  return (
    <div className="mt-16 border-t pt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          Đánh giá từ khách hàng
          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-normal">
            {reviews.length}
          </span>
        </h2>
      </div>

      {eligibleItem && (
        <div className="mb-12 bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-green-500" size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Cảm ơn bạn đã mua hàng! Hãy chia sẻ cảm nhận nhé.</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider text-[10px]">Chất lượng sản phẩm</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-all hover:scale-110 active:scale-90"
                  >
                    <Star
                      size={32}
                      className={
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  </button>
                ))}
                <span className="ml-4 text-sm text-gray-400 self-center font-medium">
                  {rating === 1 && "😕 Rất tệ"}
                  {rating === 2 && "😟 Tệ"}
                  {rating === 3 && "😐 Bình thường"}
                  {rating === 4 && "🙂 Tốt"}
                  {rating === 5 && "😍 Tuyệt vời"}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider text-[10px]">
                Nội dung đánh giá
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full rounded-xl border-gray-200 focus:border-black focus:ring-0 transition-all bg-gray-50/50 p-4 text-sm"
                placeholder="Ví dụ: Vải đẹp, đường may chắc chắn, giao hàng nhanh..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-10 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 disabled:opacity-50 transition-all ml-auto shadow-lg shadow-gray-200"
            >
              {submitting ? (
                "Đang gửi..."
              ) : (
                <>
                  <Send size={18} />
                  Gửi đánh giá
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="py-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 italic text-sm">Chưa có đánh giá nào cho sản phẩm này.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {reviews.map((review) => (
            <div key={review.id} className={`pb-8 border-b border-gray-100 last:border-0 last:pb-0 transition-all ${editId === review.id ? "bg-blue-50/30 p-6 rounded-2xl border-none" : ""}`}>
              {editId === review.id ? (
                /* EDIT MODE */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-blue-600">Chỉnh sửa đánh giá của bạn</h4>
                    <button 
                      onClick={() => setEditId(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setEditRating(star)}
                        onMouseEnter={() => setEditHoverRating(star)}
                        onMouseLeave={() => setEditHoverRating(0)}
                      >
                        <Star
                          size={24}
                          className={
                            star <= (editHoverRating || editRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-0 text-sm p-4"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditId(null)}
                      className="px-5 py-2 text-sm text-gray-600 hover:bg-white rounded-full transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={updating}
                      className="px-6 py-2 bg-blue-600 text-white text-sm rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                      {updating ? "Đang lưu..." : <><Save size={16}/> Lưu thay đổi</>}
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm uppercase">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-gray-900">{review.userName}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-200"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>

                    {currentUserId === review.userId && (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleEdit(review)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"
                          title="Sửa đánh giá"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                          title="Xóa đánh giá"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line pl-14">
                    {review.comment}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
