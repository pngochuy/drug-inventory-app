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
      alert("Lỗi kết nối Server! Hãy chắc chắn bạn đã chạy 'node server.js'");
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
    if (window.confirm("Xóa thuốc này khỏi Database?")) {
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

  return (
    <div className="p-4 max-w-6xl mx-auto animate-fade-in h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-200 rounded-full md:hidden"
        >
          <ChevronLeft />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Database className="text-blue-600" /> Quản Lý Thuốc
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Form */}
        <div className="md:col-span-1 bg-white p-5 rounded-xl shadow border h-fit">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">
            {editingId ? "Cập nhật" : "Thêm thuốc mới"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Save size={18} /> {editingId ? "Cập nhật" : "Thêm mới"}
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

        {/* List */}
        <div className="md:col-span-2 bg-white rounded-xl shadow border flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex items-center gap-2 shrink-0">
            <Search className="text-slate-400" size={20} />
            <input
              className="bg-transparent outline-none w-full"
              placeholder="Tìm kiếm thuốc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={fetchDrugs}
              className="p-2 hover:bg-gray-200 rounded-full"
              title="Tải lại"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-0 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                Đang tải...
              </div>
            )}
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="p-3">Tên thuốc</th>
                  <th className="p-3 w-20">ĐVT</th>
                  <th className="p-3 w-20 text-right">Tồn</th>
                  <th className="p-3 w-24 text-center">Xử lý</th>
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
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
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
