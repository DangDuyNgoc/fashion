"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { authService } from "../../../service/auth.service";
import { addressService } from "../../../service/address.service";
import { AddressType, CreateAddressDTO, UserProfileType } from "@/types";
import { toast } from "react-toastify";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
} from "lucide-react";
import Modal from "@/components/Modal";
import AddressForm from "@/components/AddressForm";

const DEFAULT_AVATAR = "https://res.cloudinary.com/dsfdghxx4/image/upload/v1730813754/nrxsg8sd9iy10bbsoenn_bzlq2c.png";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<
    AddressType | undefined
  >(undefined);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Profile
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, addressRes] = await Promise.all([
        authService.getProfile(),
        addressService.getMyAddresses(),
      ]);

      const profileData = profileRes.data.data;
      setProfile(profileData);
      setName(profileData.name || "");
      setPhone(profileData.phone || "");
      setAddresses(addressRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải thông tin hồ sơ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length > 0 && phone.length !== 10) {
      toast.warning("Số điện thoại phải có đúng 10 chữ số");
      return;
    }
    try {
      setIsUpdatingProfile(true);
      await authService.updateProfile({ name, phone });
      toast.success("Cập nhật hồ sơ thành công");
      fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật hồ sơ thất bại");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      await authService.uploadAvatar(file);
      toast.success("Cập nhật ảnh đại diện thành công");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Tải ảnh thất bại");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Only digits
    if (val.length <= 10) {
      setPhone(val);
    }
  };

  const handleAddressSubmit = async (data: CreateAddressDTO) => {
    try {
      setIsAddressLoading(true);
      if (selectedAddress) {
        await addressService.update(selectedAddress.id, data);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        await addressService.create(data);
        toast.success("Thêm địa chỉ mới thành công");
      }
      setIsAddressModalOpen(false);
      const res = await addressService.getMyAddresses();
      setAddresses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Thao tác với địa chỉ thất bại");
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await addressService.delete(id);
      toast.success("Xóa địa chỉ thành công");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Xóa địa chỉ thất bại");
    }
  };

  const openAddModal = () => {
    setSelectedAddress(undefined);
    setIsAddressModalOpen(true);
  };

  const openEditModal = (address: AddressType) => {
    setSelectedAddress(address);
    setIsAddressModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT: INFO UPDATES */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
            <div className="flex flex-col items-center mb-6">
              <div 
                className="relative w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 border-2 border-white shadow-md cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Image
                    src={profile?.avatarUrl ? (profile.avatarUrl.startsWith("http") ? profile.avatarUrl : `http://localhost:5015${profile.avatarUrl}`) : DEFAULT_AVATAR}
                    alt="Avatar"
                    fill
                    className="rounded-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus className="text-white w-6 h-6" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {profile?.name}
              </h2>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {profile?.role === "Admin" ? "Quản trị viên" : "Thành viên"}
              </span>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Họ và tên
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tên của bạn"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    value={phone}
                    onChange={handlePhoneChange}
                    inputMode="numeric"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Số điện thoại (10 chữ số)"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: ADDRESS MANAGEMENT */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Địa chỉ nhận hàng
              </h2>
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
              >
                <Plus className="w-4 h-4" />
                Thêm mới
              </button>
            </div>

            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400">
                  <p className="mb-2 italic">Bạn chưa thêm địa chỉ nào</p>
                  <p className="text-xs">
                    {" "}
                    Hãy nhấn &quot;Thêm mới&quot; để đặt địa chỉ nhận hàng đầu
                    tiên
                  </p>
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      address.isDefault
                        ? "bg-blue-50/30 border-blue-200"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-gray-800">
                            {address.addressLine}
                          </p>
                          {address.isDefault && (
                            <span className="text-[10px] font-black uppercase tracking-tighter bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none flex items-center">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          {address.district}, {address.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(address)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title={selectedAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
      >
        <AddressForm
          initialData={selectedAddress}
          onSubmit={handleAddressSubmit}
          isLoading={isAddressLoading}
        />
      </Modal>
    </div>
  );
}
