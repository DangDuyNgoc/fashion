import api from "@/lib/api";

export const productImagesService = {
  upload: (data: FormData) =>
    api.post("/product-images/upload-image", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  updateColor: (id: number, color: string) =>
    api.put(`/product-images/update-color/${id}`, { color }),
  delete: (id: number) => api.delete(`/product-images/delete-image/${id}`),
};
