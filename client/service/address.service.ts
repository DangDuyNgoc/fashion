import api from "@/lib/api";
import { CreateAddressDTO } from "@/types";

export const addressService = {
  getMyAddresses: () => api.get("/addresses/my-addresses"),
  
  getById: (id: number) => api.get(`/addresses/${id}`),
  
  create: (data: CreateAddressDTO) => 
    api.post("/addresses/create-address", data),
  
  update: (id: number, data: CreateAddressDTO) => 
    api.put(`/addresses/update-address/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/addresses/delete-address/${id}`),
};
