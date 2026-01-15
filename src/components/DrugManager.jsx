import React, { useState, useEffect } from "react";
import {
  Trash2,
  Save,
  Search,
  Database,
  Edit,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { API_URL } from "../config";

const DrugManager = ({ onBack }) => {
  const [drugs, setDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ TenDP: "", DVT: "", TonHT: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setDrugs(data);
    } catch (err) {
      alert("Lỗi kết nối Server!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: Date.now() }),
        });
      }
      setFormData({ TenDP: "", DVT: "", TonHT: 0 });
      setEditingId(null);
      fetchDrugs();
    } catch (err) {
      alert("Lỗi khi lưu dữ liệu");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thuốc này?")) {
      try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        fetchDrugs();
      } catch (err) {
        alert("Lỗi khi xóa");
      }
    }
  };

  const filteredData = drugs.filter((item) =>
    item.TenDP?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- TÍNH TOÁN THỐNG KÊ ---
  // 1. Tổng số đầu thuốc (loại thuốc)
  const totalDrugTypes = drugs.length;

  // 2. Tổng số lượng tồn kho (cộng dồn TonHT của tất cả thuốc)
  const totalStock = drugs.reduce(
    (sum, item) => sum + (Number(item.TonHT) || 0),
    0
  );

  return (
    // THAY ĐỔI 1: Dùng h-[100dvh] để fix cứng chiều cao bằng màn hình điện thoại
    <div className="p-2 md:p-4 max-w-6xl mx-auto animate-fade-in h-[100dvh] flex flex-col overflow-hidden">
      {/* Header - Giữ nguyên kích thước */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Quản lý danh mục thuốc
          </h2>
          {/* PHẦN THÊM MỚI: Hiển thị thống kê */}
          <div className="flex gap-3 mt-1 text-sm">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-medium">
              Số đầu thuốc: {loading ? "..." : totalDrugTypes}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-md font-medium">
              Tổng tồn kho: {loading ? "..." : totalStock.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Container chính: Trên Mobile là Flex Column, trên Desktop là Grid */}
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 flex-1 overflow-hidden min-h-0">
        {/* Form: Trên mobile sẽ nằm trên, kích thước tự nhiên */}
        <div className="md:col-span-1 bg-white p-3 md:p-5 rounded-xl shadow border h-fit shrink-0 overflow-y-auto max-h-[40vh] md:max-h-none">
          <h3 className="font-semibold text-lg mb-2 text-slate-700">
            {editingId ? "Cập nhật" : "Thêm thuốc mới"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-600">
                Tên thuốc
              </label>
              <input
                required
                className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.TenDP}
                onChange={(e) =>
                  setFormData({ ...formData, TenDP: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  ĐVT
                </label>
                <input
                  required
                  className="w-full border p-2 rounded outline-none"
                  value={formData.DVT}
                  onChange={(e) =>
                    setFormData({ ...formData, DVT: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Tồn kho
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded outline-none"
                  value={formData.TonHT}
                  onChange={(e) =>
                    setFormData({ ...formData, TonHT: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex justify-center gap-2 items-center font-medium"
              >
                <Save size={18} /> {editingId ? "Lưu" : "Thêm"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ TenDP: "", DVT: "", TonHT: 0 });
                  }}
                  className="px-4 bg-gray-200 rounded"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List: THAY ĐỔI QUAN TRỌNG - flex-1 để chiếm hết phần còn lại */}
        <div className="md:col-span-2 bg-white rounded-xl shadow border flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-3 border-b bg-slate-50 flex items-center gap-2 shrink-0">
            <Search className="text-slate-400" size={20} />
            <input
              className="bg-transparent outline-none w-full"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={fetchDrugs}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-0 relative custom-scrollbar">
            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                Đang tải...
              </div>
            )}
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-3">Tên thuốc</th>
                  <th className="p-3 w-16">ĐVT</th>
                  <th className="p-3 w-16 text-right">Tồn</th>
                  <th className="p-3 w-20 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 group">
                    <td className="p-3 font-medium">{item.TenDP}</td>
                    <td className="p-3 text-slate-600">{item.DVT}</td>
                    <td className="p-3 text-right font-mono">{item.TonHT}</td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-blue-600 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn sự kiện lan ra tr (tránh lỗi double tap mobile)
                          handleDelete(item.id);
                        }}
                        className="p-1 text-red-600 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filteredData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugManager;
