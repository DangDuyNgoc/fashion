"use client";

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { authService } from "@/service/auth.service";
import { User } from "@/types/api";

const UsersPage = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authService.getAllUsers();
      setData(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const tableColumns = columns(fetchUsers);

  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">Tất cả người dùng</h1>
      </div>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <DataTable columns={tableColumns} data={data} onRefresh={fetchUsers} />
      )}
    </div>
  );
};

export default UsersPage;
