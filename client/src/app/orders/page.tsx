"use client";

import { useEffect, useState } from "react";
import { orderService } from "../../../service/order.service";
import { reviewService } from "../../../service/review.service";
import { OrderType } from "@/types";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  Calendar,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case "processing":
      return <Package className="w-5 h-5 text-blue-500" />;
    case "shipped":
      return <Truck className="w-5 h-5 text-purple-500" />;
    case "delivered":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "cancelled":
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "Đang chờ";
    case "processing":
      return "Đang xử lý";
    case "shipped":
      return "Đang giao hàng";
    case "delivered":
      return "Đã giao hàng";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
};

const getStatusColorClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "shipped":
      return "bg-purple-50 text-purple-700 border-purple-100";
    case "delivered":
      return "bg-green-50 text-green-700 border-green-100";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-gray-50 text-gray-700 border-gray-100";
  }
};

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "processing" | "delivered" | "cancelled">("all");
  
  // Review state
  const [reviewingItem, setReviewingItem] = useState<{orderItemId: number, productName: string} | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleSubmitReview = async () => {
    if (!reviewingItem) return;
    try {
      setSubmittingReview(true);
      await reviewService.createReview({
        orderItemId: reviewingItem.orderItemId,
        rating,
        comment
      });
      toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
      setReviewingItem(null);
      setRating(5);
      setComment("");
    } catch (error) {
      console.error(error);
      toast.error("Không thể gửi đánh giá. Có thể bạn đã đánh giá sản phẩm này rồi.");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders();
        const data = res.data.data || res.data;
        setOrders(data);
        setFilteredOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredOrders(orders);
    } else if (activeTab === "processing") {
      setFilteredOrders(orders.filter(o => ["pending", "processing", "shipped"].includes(o.status.toLowerCase())));
    } else if (activeTab === "delivered") {
      setFilteredOrders(orders.filter(o => o.status.toLowerCase() === "delivered"));
    } else if (activeTab === "cancelled") {
      setFilteredOrders(orders.filter(o => o.status.toLowerCase() === "cancelled"));
    }
  }, [activeTab, orders]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-500">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi các đơn hàng đã đặt</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl self-start">
          <button 
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setActiveTab("delivered")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'delivered' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Lịch sử
          </button>
          <button 
            onClick={() => setActiveTab("processing")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'processing' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Đang xử lý
          </button>
          <button 
            onClick={() => setActiveTab("cancelled")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'cancelled' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Đã hủy
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
             <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <p className="text-gray-500">Không có đơn hàng nào trong mục này.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* HEADER */}
              <div 
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${getStatusColorClass(order.status).split(' ')[0]}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Đơn hàng #{order.id}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(order.createdAt), "dd MMM, yyyy HH:mm", { locale: vi })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-0.5">Tổng tiền</p>
                    <p className="font-bold text-lg text-gray-900">
                      {new Intl.NumberFormat("vi-VN").format(order.totalPrice)} ₫
                    </p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColorClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </div>
                  {expandedOrder === order.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {/* DETAILS (EXPANDABLE) */}
              {expandedOrder === order.id && (
                <div className="px-6 pb-6 bg-gray-50/50 pt-4 border-t border-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Shipping Info */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Thông tin giao nhận</h4>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100 shadow-sm flex-shrink-0">
                          <MapPin className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{order.address}</p>
                      </div>
                    </div>
                    {/* Payment Info */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Thanh toán</h4>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100 shadow-sm flex-shrink-0">
                          <CreditCard className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Phương thức: <span className="font-bold text-gray-800">{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Sản phẩm đã mua</h4>
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {order.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 flex items-center justify-between ${idx !== order.items.length - 1 ? 'border-b border-gray-50' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                             <Package className="w-6 h-6 text-gray-300" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                            <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="font-bold text-sm text-gray-800">
                            {new Intl.NumberFormat("vi-VN").format(item.price)} ₫
                          </p>
                          {order.status.toLowerCase() === 'delivered' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setReviewingItem({ orderItemId: item.id, productName: item.productName });
                              }}
                              className="text-[10px] bg-black text-white px-3 py-1 rounded-full hover:bg-gray-800 transition-colors uppercase font-bold tracking-tighter"
                            >
                              Đánh giá
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="p-4 bg-gray-50/50 flex justify-between items-center bg-gray-50">
                      <span className="text-sm font-medium text-gray-600">Tổng cộng</span>
                      <span className="text-lg font-bold text-gray-900">
                        {new Intl.NumberFormat("vi-VN").format(order.totalPrice)} ₫
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* REVIEW MODAL */}
      {reviewingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-in-center">
            <div className="bg-gray-900 p-6 text-white text-center">
              <h3 className="text-xl font-bold">Đánh giá sản phẩm</h3>
              <p className="text-gray-400 text-sm mt-2 line-clamp-1">{reviewingItem.productName}</p>
            </div>
            <div className="p-8">
              <div className="flex flex-col items-center gap-6 mb-8">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Chất lượng sản phẩm</p>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setRating(s)}
                      className="transition-transform active:scale-90 hover:scale-110"
                    >
                      <Star 
                        className={`w-10 h-10 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                      />
                    </button>
                  ))}
                </div>
                <p className="font-bold text-gray-800">
                  {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Không hài lòng' : 'Tệ'}
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Nhận xét của bạn</label>
                <textarea
                  className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm resize-none"
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setReviewingItem(null)}
                  disabled={submittingReview}
                  className="flex-1 py-4 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !comment.trim()}
                  className="flex-1 py-4 bg-black text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingReview ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Gửi đánh giá'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

