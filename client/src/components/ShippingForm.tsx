import { AddressType, CreateAddressDTO, ShippingFormInputs, shippingFormSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Edit, MapPin, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { authService } from "../../service/auth.service";
import { addressService } from "../../service/address.service";
import { toast } from "react-toastify";
import Modal from "./Modal";
import AddressForm from "./AddressForm";

const ShippingForm = ({
  setShippingForm,
}: {
  setShippingForm: (data: ShippingFormInputs) => void;
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ShippingFormInputs>({
    resolver: zodResolver(shippingFormSchema),
  });

  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressType | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectAddress = useCallback((addr: AddressType) => {
    setSelectedAddressId(addr.id);
    setValue("address", addr.addressLine + (addr.district ? `, ${addr.district}` : ""));
    setValue("city", addr.city);
    setValue("addressId", addr.id);
  }, [setValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Profile to pre-fill basic info
        const profileRes = await authService.getProfile();
        const user = profileRes.data.data || profileRes.data;
        setValue("name", user.name);
        setValue("email", user.email);
        setValue("phone", user.phone);

        // Fetch Addresses
        const addressRes = await addressService.getMyAddresses();
        const addrList = addressRes.data;
        setAddresses(addrList);

        if (addrList.length > 0) {
          const defaultAddr = addrList.find((a: AddressType) => a.isDefault) || addrList[0];
          handleSelectAddress(defaultAddr);
        }
      } catch (err) {
        console.error("Failed to fetch shipping data", err);
      }
    };
    fetchData();
  }, [setValue, handleSelectAddress]);

  const handleShippingForm: SubmitHandler<ShippingFormInputs> = (data) => {
    setShippingForm(data);
    router.push("/cart?step=3", { scroll: false });
  };

  const handleAddressSubmit = async (data: CreateAddressDTO) => {
    try {
      setIsLoading(true);
      if (editingAddress) {
        await addressService.update(editingAddress.id, data);
        toast.success("Đã cập nhật địa chỉ");
      } else {
        await addressService.create(data);
        toast.success("Đã thêm địa chỉ mới");
      }
      // Refresh addresses
      const res = await addressService.getMyAddresses();
      setAddresses(res.data);
      setIsModalOpen(false);
    } catch {
      toast.error("Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ADDRESS SELECTION */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Chọn địa chỉ nhận hàng
          </h3>
          <button
            type="button"
            onClick={() => {
              setEditingAddress(undefined);
              setIsModalOpen(true);
            }}
            className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Thêm địa chỉ mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => handleSelectAddress(addr)}
              className={`relative p-4 border rounded-xl cursor-pointer transition-all ${
                selectedAddressId === addr.id
                  ? "border-gray-800 bg-gray-50 ring-1 ring-gray-800"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="flex flex-col gap-1 pr-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">
                    {addr.isDefault ? "Mặc định" : "Địa chỉ"}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-1">{addr.addressLine}</p>
                <p className="text-[10px] text-gray-400">
                  {addr.district}, {addr.city}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingAddress(addr);
                  setIsModalOpen(true);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
              >
                <Edit className="w-3 h-3" />
              </button>
            </div>
          ))}
          {addresses.length === 0 && (
            <p className="text-xs text-gray-400 col-span-2 py-4 text-center border-2 border-dashed rounded-xl">
              Bạn chưa có địa chỉ nào được lưu.
            </p>
          )}
        </div>
      </div>

      <form
        className="flex flex-col gap-4 border-t pt-6"
        onSubmit={handleSubmit(handleShippingForm)}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-xs text-gray-500 font-medium">
            Họ và Tên
          </label>
          <input
            className="border-b border-gray-200 py-2 outline-none text-sm focus:border-gray-800 transition-colors"
            type="text"
            id="name"
            placeholder="John Doe"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs text-gray-500 font-medium">
              Địa chỉ Email
            </label>
            <input
              className="border-b border-gray-200 py-2 outline-none text-sm focus:border-gray-800 transition-colors"
              type="email"
              id="email"
              placeholder="johndoe@gmail.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-xs text-gray-500 font-medium">
              Số điện thoại
            </label>
            <input
              className="border-b border-gray-200 py-2 outline-none text-sm focus:border-gray-800 transition-colors"
              type="text"
              id="phone"
              placeholder="0123456789"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="text-xs text-gray-500 font-medium">
            Địa chỉ chi tiết
          </label>
          <input
            className="border-b border-gray-200 py-2 outline-none text-sm focus:border-gray-800 transition-colors"
            type="text"
            id="address"
            placeholder="123 Nguyễn Văn Cừ, Quận 5"
            {...register("address")}
          />
          {errors.address && (
            <p className="text-xs text-red-500">{errors.address.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="city" className="text-xs text-gray-500 font-medium">
            Thành phố
          </label>
          <input
            className="border-b border-gray-200 py-2 outline-none text-sm focus:border-gray-800 transition-colors"
            type="text"
            id="city"
            placeholder="Hồ Chí Minh"
            {...register("city")}
          />
          {errors.city && (
            <p className="text-xs text-red-500">{errors.city.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 text-white p-3 mt-4 rounded-lg cursor-pointer flex items-center justify-center gap-2 font-medium"
        >
          Tiếp tục thanh toán
          <ArrowRight className="w-3 h-3" />
        </button>
      </form>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
      >
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleAddressSubmit}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
};

export default ShippingForm;
