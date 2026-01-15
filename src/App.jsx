import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Plus,
  Upload,
  FileSpreadsheet,
  Database,
  Menu,
  AlertCircle,
} from "lucide-react";

import InventorySheet from "./components/InventorySheet";
import DrugManager from "./components/DrugManager";
import { API_URL } from "./config";

function App() {
  const [view, setView] = useState("inventory");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [masterDrugs, setMasterDrugs] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  const fetchMasterDrugs = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) setMasterDrugs(data);
    } catch (error) {
      console.error("Không kết nối được server");
    }
  };

  useEffect(() => {
    fetchMasterDrugs();
    setInventoryItems(
      Array(1)
        .fill()
        .map((_, i) => ({ id: Date.now() + i, stockBook: 0, stockReal: 0 }))
    );
  }, []);

  const importExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName =
        workbook.SheetNames.find((n) => n.toLowerCase().includes("tong")) ||
        workbook.SheetNames[0];
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const cleanData = jsonData
        .map((item, idx) => ({
          id: Date.now() + idx,
          TenDP: item["TenDP"] || item["Tên thuốc"] || "Thuốc chưa đặt tên",
          DVT: item["DVT"] || item["Đvt"] || "",
          TonHT: item["TonHT"] || item["Tồn kho"] || 0,
        }))
        .filter((i) => i.TenDP);

      const res = await fetch(`${API_URL}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      if (res.ok) {
        alert(`Đã upload thành công ${cleanData.length} thuốc!`);
        fetchMasterDrugs();
      } else {
        alert("Lỗi khi upload lên server");
      }
    } catch (err) {
      alert("Lỗi đọc file Excel");
    }
    e.target.value = null;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 w-64 h-full bg-white border-r shadow-lg transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-3 shadow-blue-200 shadow-xl">
            <Plus className="rotate-45" size={28} />
          </div>
          <h1 className="font-bold text-xl text-slate-800">Hospital Pharma</h1>
          {/* <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
            <div className={`w-2 h-2 rounded-full bg-green-500`}></div>
            Connected: Server
          </div> */}
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => {
              setView("inventory");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              view === "inventory"
                ? "bg-blue-50 text-blue-700 font-bold"
                : "text-slate-600 hover:bg-gray-50"
            }`}
          >
            <FileSpreadsheet size={20} /> Kiểm Kê Thuốc
          </button>
          <button
            onClick={() => {
              setView("manager");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              view === "manager"
                ? "bg-blue-50 text-blue-700 font-bold"
                : "text-slate-600 hover:bg-gray-50"
            }`}
          >
            <Database size={20} /> Danh Mục Thuốc
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t bg-slate-50 space-y-2">
          <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 text-sm font-medium shadow-sm transition-transform active:scale-95">
            <Upload size={16} /> Import Excel
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={importExcel}
            />
          </label>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <div className="md:hidden bg-white border-b p-4 flex items-center justify-between shadow-sm z-20">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu />
          </button>
          <span className="font-bold text-slate-800">
            {view === "inventory" ? "Kiểm Kê" : "Quản Lý Thuốc"}
          </span>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {masterDrugs.length === 0 && view === "inventory" && (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md border border-slate-100">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2">Server đang trống</h2>
                <p className="text-slate-500 mb-6">
                  Chưa có dữ liệu thuốc nào trong <code>db.json</code>. Vui lòng
                  Import Excel.
                </p>
                <label className="btn-primary w-full py-3 justify-center cursor-pointer bg-blue-600 text-white font-bold rounded-lg flex gap-2 hover:bg-blue-700">
                  <Upload size={20} /> Import Excel Ngay
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={importExcel}
                  />
                </label>
              </div>
            </div>
          )}

          {view === "inventory" ? (
            <InventorySheet
              drugs={masterDrugs}
              inventoryItems={inventoryItems}
              setInventoryItems={setInventoryItems}
              onRefreshMaster={fetchMasterDrugs}
            />
          ) : (
            <DrugManager onBack={() => setView("inventory")} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
