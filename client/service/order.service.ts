import api from "@/lib/api";

export const orderService = {
  create: (data: { addressId?: number; paymentMethod: string }) =>
    api.post("/orders", data),

  getMyOrders: () => api.get("/orders"),

  getById: (id: number) => api.get(`/orders/${id}`),
};
