import api from "@/lib/api";

export const ordersService = {
  getAll: () => api.get("/orders/admin/all-orders"),
  getById: (id: number) => api.get(`/orders/admin/orders/${id}`),
  updateStatus: (id: number, status: string | number) =>
    api.patch(`/orders/admin/orders/${id}/status`, { status }),
};
