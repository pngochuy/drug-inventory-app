import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import {
  Trash2,
  Plus,
  FileSpreadsheet,
  Search,
  X,
  Printer,
  RefreshCw,
} from "lucide-react";

import AutoResizeTextarea from "./AutoResizeTextarea";
import PrintView from "./PrintView";

const InventorySheet = ({
  drugs,
  inventoryItems,
  setInventoryItems,
  onRefreshMaster,
}) => {
  const [dateParts, setDateParts] = useState({
    day: "",
    month: "",
    year: "",
  });

  const [timeParts, setTimeParts] = useState({
    startH: "",
    startM: "",
    endH: "",
    endM: "",
  });

  const [metaData, setMetaData] = useState({
    department: "khám Răng hàm mặt",
    members: [
      { name: "Trần Thị Đảm", role: "Trưởng khoa dược", title: "Tổ trưởng" },
      {
        name: "Nguyễn Thị Nhàn",
        role: "Nhân viên khoa Dược",
        title: "Thành viên",
      },
      {
        name: "",
        role: "Điều dưỡng trưởng khoa phòng",
        title: "Thành viên",
      },
      {
        name: "",
        role: "Điều dưỡng phụ trách dược",
        title: "Thành viên",
      },
    ],
  });
  const [proposal, setProposal] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const componentRef = useRef();
  const searchInputRef = useRef();
  const printRef = useRef();

  const fullDateString =
    dateParts.day && dateParts.month && dateParts.year
      ? `${dateParts.year}-${dateParts.month}-${dateParts.day}`
      : "Chua-nhap-ngay";

  const [isGenerating, setIsGenerating] = useState(false);
  // --- Print & PDF Handlers ---
  const handleDownloadPDF = () => {
    setIsGenerating(true); // Bắt đầu loading
    const element = printRef.current;

    // Tên file
    const fileName = `Biên-bản-kiểm-kê-thuốc-tủ-trực-${fullDateString}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 }, // Giảm quality xíu cho nhẹ
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        windowWidth: 800,
        logging: false,
        letterRendering: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true, // Bật nén để file nhẹ hơn trên mobile
      },
    };

    // 1. Kiểm tra xem thiết bị có phải là Mobile không
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // QUAN TRỌNG: Thay đổi cách xuất file
    // Thay vì .save() ngay, chúng ta xuất ra dạng BLOB để xử lý
    html2pdf()
      .set(opt)
      .from(element)
      .output("blob") // Xuất ra dữ liệu Blob
      .then(async (blob) => {
        // TRƯỜNG HỢP 1: LÀ ĐIỆN THOẠI (Mobile) -> Dùng Web Share API
        if (isMobile && navigator.canShare) {
          // Tạo một đối tượng File từ Blob để chia sẻ
          const file = new File([blob], fileName, { type: "application/pdf" });
          // KIỂM TRA: Nếu là Mobile và trình duyệt hỗ trợ chia sẻ file (Share Sheet)
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: "Biên bản kiểm kê",
                text: "Gửi biên bản kiểm kê thuốc.",
              });
              // Chia sẻ thành công thì dừng, không cần tải xuống kiểu cũ
              return;
            } catch (error) {
              console.log("Người dùng đã hủy chia sẻ hoặc lỗi:", error);
              // Nếu lỗi (hoặc user hủy), vẫn để code chạy tiếp xuống dưới để fallback tải thường
            }
          }
        }

        // TRƯỜNG HỢP 2: LÀ MÁY TÍNH (PC) hoặc Mobile không hỗ trợ Share -> Tải xuống trực tiếp
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        setIsGenerating(false); // Xong việc thì tắt loading
        // Dọn dẹp bộ nhớ
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      })
      .catch(() => setIsGenerating(false)); // Lỗi cũng tắt loading;
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bien-ban-kiem-ke-${fullDateString}`,
  });

  // --- Date/Time Handlers ---
  const handleDateChange = (field, value) => {
    if (value === "") {
      setDateParts((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    let val = parseInt(value);
    if (isNaN(val)) return;
    if (field === "day" && val > 31) val = 31;
    if (field === "month" && val > 12) val = 12;
    setDateParts((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateBlur = (field) => {
    if (dateParts[field] === "") return;
    let val = parseInt(dateParts[field]) || 0;
    if (field === "day") {
      if (val < 1) val = 1;
      if (val > 31) val = 31;
    }
    if (field === "month") {
      if (val < 1) val = 1;
      if (val > 12) val = 12;
    }
    if (field === "year") {
      if (val < 100 && val > 0) val = 2000 + val;
      const currentYear = new Date().getFullYear();
      if (val < 1900) val = currentYear;
    }
    setDateParts((prev) => ({
      ...prev,
      [field]:
        field === "year" ? val.toString() : val.toString().padStart(2, "0"),
    }));
  };

  const handleTimeChange = (field, value) => {
    if (value === "") {
      setTimeParts((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    let val = parseInt(value);
    if (isNaN(val)) return;
    if (field.includes("H") && val > 23) val = 23;
    if (field.includes("M") && val > 59) val = 59;
    setTimeParts((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimeBlur = (field) => {
    if (timeParts[field] === "") return;
    let val = parseInt(timeParts[field]) || 0;
    if (field.includes("H")) {
      if (val < 0) val = 0;
      if (val > 23) val = 23;
    }
    if (field.includes("M")) {
      if (val < 0) val = 0;
      if (val > 59) val = 59;
    }
    setTimeParts((prev) => ({
      ...prev,
      [field]: val.toString().padStart(2, "0"),
    }));
  };

  // --- Modal Logic ---
  useEffect(() => {
    if (modalOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [modalOpen]);

  const openModal = (idx) => {
    setCurrentRow(idx);
    setSearchTerm("");
    setModalOpen(true);
  };

  const selectDrug = (drug) => {
    const newItems = [...inventoryItems];
    newItems[currentRow] = {
      ...newItems[currentRow],
      name: drug.TenDP,
      unit: drug.DVT,
      stockBook: drug.TonHT,
      stockReal: drug.TonHT,
    };
    setInventoryItems(newItems);
    setModalOpen(false);
  };

  const addRow = () =>
    setInventoryItems([
      ...inventoryItems,
      { id: Date.now(), stockBook: 0, stockReal: 0 },
    ]);

  const removeRow = (id) => {
    if (window.confirm("Xóa dòng này?"))
      setInventoryItems((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id, field, val) =>
    setInventoryItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: val } : row))
    );

  const filteredDrugs = drugs.filter((d) =>
    d.TenDP?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* TOOLBAR */}
      <div className="bg-white border-b px-4 py-3 flex flex-col md:flex-row justify-between items-center sticky top-0 z-30 shadow-sm no-print gap-2">
        <h1 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
          <FileSpreadsheet className="text-green-600" /> Kiểm Kê
        </h1>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={onRefreshMaster}
            className="whitespace-nowrap text-blue-600 hover:bg-blue-50 px-3 py-2 rounded flex gap-1 items-center text-sm font-medium border border-transparent hover:border-blue-100"
          >
            <RefreshCw size={14} /> Reload
          </button>
          <button
            onClick={addRow}
            className="whitespace-nowrap bg-gray-100 hover:bg-gray-200 text-slate-700 px-3 py-2 rounded flex items-center gap-1 text-sm font-medium"
          >
            <Plus size={16} /> Dòng
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating} // Khóa nút khi đang tạo
            className={`whitespace-nowrap px-4 py-2 rounded flex items-center gap-2 font-medium shadow-sm text-sm ml-auto md:ml-0 ${
              isGenerating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            <Printer size={18} />{" "}
            {isGenerating ? "Đang tạo PDF..." : "In Biên Bản"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-8 bg-slate-100/50">
        <div
          className="w-full md:max-w-[210mm] mx-auto bg-white md:shadow-xl min-h-[297mm] p-4 md:p-12 print:shadow-none print:p-0 print:w-full print:max-w-none"
          ref={componentRef}
        >
          {/* HEADER QUỐC HIỆU TIÊU NGỮ */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6 gap-4">
            <div className="text-center">
              <p className="font-bold uppercase text-[11px] md:text-[13px]">
                BỆNH VIỆN ĐÀ NẴNG
              </p>
              <p className="font-bold uppercase underline text-[11px] md:text-[13px]">
                KHOA DƯỢC
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold uppercase text-[11px] md:text-[13px]">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p className="font-bold underline text-[11px] md:text-[13px]">
                Độc lập - Tự do - Hạnh phúc
              </p>
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 uppercase">
            BIÊN BẢN KIỂM KÊ THUỐC TỦ TRỰC
          </h2>

          {/* INPUT NGÀY GIỜ & THÀNH VIÊN */}
          <div className="mb-4 text-[13px] md:text-[14px] leading-relaxed">
            <div className="flex flex-wrap items-baseline gap-1 justify-center md:justify-start">
              <span>Hôm nay, ngày</span>
              <input
                type="number"
                className="w-8 text-center border-b border-dotted border-black outline-none bg-transparent font-bold"
                value={dateParts.day}
                onChange={(e) => handleDateChange("day", e.target.value)}
                onBlur={() => handleDateBlur("day")}
              />
              <span>tháng</span>
              <input
                type="number"
                className="w-8 text-center border-b border-dotted border-black outline-none bg-transparent font-bold"
                value={dateParts.month}
                onChange={(e) => handleDateChange("month", e.target.value)}
                onBlur={() => handleDateBlur("month")}
              />
              <span>năm</span>
              <input
                type="number"
                className="w-12 text-center border-b border-dotted border-black outline-none bg-transparent font-bold"
                value={dateParts.year}
                onChange={(e) => handleDateChange("year", e.target.value)}
                onBlur={() => handleDateBlur("year")}
              />
              <span>, tại khoa</span>
              <input
                className="font-bold min-w-[100px] bg-transparent text-left md:text-left"
                value={metaData.department}
                onChange={(e) =>
                  setMetaData({ ...metaData, department: e.target.value })
                }
              />
            </div>

            <p className="font-bold mt-2">Tổ kiểm kê gồm có:</p>
            <table className="w-full mb-2">
              <tbody>
                {metaData.members.map((mem, i) => (
                  <tr
                    key={i}
                    className="flex flex-col md:table-row mb-2 md:mb-0 border-b md:border-none border-dashed pb-1 md:pb-0"
                  >
                    <td className="w-auto md:w-6 align-top font-bold md:font-normal inline md:table-cell mr-1">
                      {i + 1}.
                    </td>
                    <td className="w-full md:w-[40%] block md:table-cell">
                      <input
                        className="w-full border-b border-dotted border-gray-400 outline-none font-semibold bg-transparent"
                        placeholder="Tên thành viên"
                        value={mem.name}
                        onChange={(e) => {
                          const newMems = [...metaData.members];
                          newMems[i].name = e.target.value;
                          setMetaData({ ...metaData, members: newMems });
                        }}
                      />
                    </td>
                    <td className="italic text-gray-600 block md:table-cell md:px-2">
                      - {mem.role}
                    </td>
                    <td className="text-left font-semibold block md:table-cell">
                      - {mem.title}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TIME INPUT */}
            <div className="flex flex-wrap items-baseline gap-1 mt-2">
              <span>Đã tiến hành kiểm kê thuốc tủ trực tại khoa</span>
              <input
                className="font-bold max-w-[140px] bg-transparent text-left md:text-left"
                value={metaData.department}
                onChange={(e) =>
                  setMetaData({ ...metaData, department: e.target.value })
                }
              />
              <span>từ</span>
              <input
                type="number"
                className="w-8 text-center border-b border-dotted border-black outline-none font-bold"
                value={timeParts.startH}
                onChange={(e) => handleTimeChange("startH", e.target.value)}
                onBlur={() => handleTimeBlur("startH")}
              />
              giờ
              <input
                type="number"
                className="w-8 text-center border-b border-dotted border-black outline-none font-bold"
                value={timeParts.startM}
                onChange={(e) => handleTimeChange("startM", e.target.value)}
                onBlur={() => handleTimeBlur("startM")}
              />
              <span>đến</span>
              <input
                type="number"
                className="w-8 text-center border-b border-dotted border-black outline-none font-bold"
                value={timeParts.endH}
                onChange={(e) => handleTimeChange("endH", e.target.value)}
                onBlur={() => handleTimeBlur("endH")}
              />
              giờ
              <input
                type="number"
                className="w-8 text-center border-b border-dotted border-black outline-none font-bold"
                value={timeParts.endM}
                onChange={(e) => handleTimeChange("endM", e.target.value)}
                onBlur={() => handleTimeBlur("endM")}
              />
            </div>
            <p className="mt-2 font-bold print:text-black print:not-italic print:font-normal">
              - Kết quả như sau:
            </p>
          </div>

          {/* TABLE */}
          <div className="border border-gray-400 mb-4 bg-white relative">
            <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
              <table className="w-full border-separate border-spacing-0 min-w-[900px] text-[12px]">
                <thead className="sticky top-0 z-40">
                  <tr className="bg-gray-200 text-center font-bold text-slate-800">
                    <th
                      className="border-r border-b border-gray-400 p-1 w-10 bg-gray-200"
                      rowSpan={2}
                    >
                      Stt
                    </th>
                    <th
                      className="border-r border-b border-gray-400 p-1 bg-gray-200"
                      rowSpan={2}
                      style={{ minWidth: "200px" }}
                    >
                      Tên thuốc, nồng độ, hàm lượng
                    </th>
                    <th
                      className="border-r border-b border-gray-400 p-1 w-12"
                      rowSpan={2}
                    >
                      Đvt
                    </th>
                    <th
                      className="border-r border-b border-gray-400 p-1 w-20"
                      rowSpan={2}
                    >
                      Số kiểm soát
                    </th>
                    <th
                      className="border-r border-b border-gray-400 p-1 w-16"
                      rowSpan={2}
                    >
                      Nước SX
                    </th>
                    <th
                      className="border-r border-b border-gray-400 p-1 w-16"
                      rowSpan={2}
                    >
                      Hạn dùng
                    </th>
                    <th
                      className="border-r border-b border-gray-400 p-1"
                      colSpan={2}
                    >
                      Số lượng
                    </th>
                    <th
                      className="border-r border-b border-gray-400 p-1 w-12"
                      rowSpan={2}
                    >
                      Hỏng vỡ
                    </th>
                    <th
                      className="border-r border-b border-gray-400 p-1"
                      rowSpan={2}
                    >
                      Ghi chú
                    </th>
                    <th
                      className="border-b border-gray-400 p-1 w-8 no-print bg-gray-200"
                      rowSpan={2}
                    ></th>
                  </tr>
                  <tr className="bg-gray-200 text-center font-bold text-slate-800">
                    <th className="border-r border-b border-gray-400 p-1 w-12">
                      Sổ sách
                    </th>
                    <th className="border-r border-b border-gray-400 p-1 w-12">
                      Thực tế
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {inventoryItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-blue-50 align-top"
                    >
                      <td className="border-r border-b border-gray-400 p-1 text-center bg-white group-hover:bg-blue-50">
                        {idx + 1}
                      </td>
                      <td
                        className="border-r border-b border-gray-400 p-1 text-left relative cursor-pointer bg-white group-hover:bg-blue-50"
                        onClick={() => openModal(idx)}
                      >
                        {item.name || (
                          <span className="text-gray-400 italic no-print flex items-center gap-1 justify-center text-[10px]">
                            <Search size={10} /> Chọn thuốc
                          </span>
                        )}
                      </td>
                      <td className="border-r border-b border-gray-400 p-1 text-center bg-white group-hover:bg-blue-50">
                        {item.unit}
                      </td>
                      <td className="border-r border-b border-gray-400 p-1 bg-white group-hover:bg-blue-50">
                        <AutoResizeTextarea
                          className="text-center"
                          value={item.controlNo}
                          onChange={(e) =>
                            updateRow(item.id, "controlNo", e.target.value)
                          }
                        />
                      </td>
                      <td className="border-r border-b border-gray-400 p-1 bg-white group-hover:bg-blue-50">
                        <AutoResizeTextarea
                          className="text-center"
                          value={item.country}
                          onChange={(e) =>
                            updateRow(item.id, "country", e.target.value)
                          }
                        />
                      </td>
                      <td className="border-r border-b border-gray-400 p-1 bg-white group-hover:bg-blue-50">
                        <AutoResizeTextarea
                          className="text-center"
                          placeholder="mm/yy"
                          value={item.expiry}
                          onChange={(e) =>
                            updateRow(item.id, "expiry", e.target.value)
                          }
                        />
                      </td>
                      <td className="border-r border-b border-gray-400 p-1 font-semibold text-center align-middle bg-white group-hover:bg-blue-50">
                        {item.stockBook}
                      </td>
                      <td className="border-r border-b border-gray-400 p-1 align-middle bg-white group-hover:bg-blue-50">
                        <AutoResizeTextarea
                          isNumber={true}
                          className={`text-center font-bold `}
                          value={item.stockReal}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              updateRow(item.id, "stockReal", "");
                              return;
                            }
                            if (!/^\d+$/.test(val)) return;
                            updateRow(item.id, "stockReal", val);
                          }}
                        />
                      </td>
                      <td className="border-r border-b border-gray-400 p-1 bg-white group-hover:bg-blue-50">
                        <AutoResizeTextarea
                          className="text-center"
                          value={item.broken}
                          onChange={(e) =>
                            updateRow(item.id, "broken", e.target.value)
                          }
                        />
                      </td>
                      <td className="border-r border-b border-gray-400 p-1 bg-white group-hover:bg-blue-50">
                        <AutoResizeTextarea
                          className="text-left"
                          value={item.note}
                          onChange={(e) =>
                            updateRow(item.id, "note", e.target.value)
                          }
                        />
                      </td>
                      <td className="border-b border-gray-400 p-0 no-print text-center align-middle bg-white group-hover:bg-blue-50">
                        <button
                          onClick={() => removeRow(item.id)}
                          className="inline-flex items-center justify-center p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="sticky bottom-0 z-30">
                  <tr className="font-bold text-slate-800 text-[12px]">
                    <td className="border-r border-t border-gray-400 bg-white left-0 z-30"></td>
                    <td
                      colSpan={10}
                      className="border-t border-gray-400 p-2 text-left bg-white align-middle shadow-[0_-1px_0_rgba(0,0,0,0.1)]"
                    >
                      Cộng khoản: {inventoryItems.filter((i) => i.name).length}{" "}
                      khoản
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Ý KIẾN ĐỀ XUẤT */}
          <div className="mt-4 mb-2 text-[13px]">
            <p className="font-bold italic mb-1">Ý kiến đề xuất:</p>
            <AutoResizeTextarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              className="w-full text-left"
              style={{
                lineHeight: "28px",
                backgroundImage:
                  "repeating-linear-gradient(transparent, transparent 27px, #9ca3af 28px)",
                backgroundAttachment: "local",
                paddingTop: "0px",
                minHeight: "84px",
              }}
            />
          </div>

          {/* FOOTER CHỮ KÝ */}
          <div className="mt-10 pt-4 break-inside-avoid text-[13px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <p className="font-bold text-[14px] uppercase mb-6 underline decoration-1 underline-offset-4">
                  KHOA PHÒNG
                </p>
                <div className="flex justify-around gap-4">
                  <div className="flex-1 flex flex-col items-center">
                    <p className="font-bold mb-20 uppercase text-xs md:text-sm">
                      Điều dưỡng trưởng
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <p className="font-bold mb-20 uppercase text-xs md:text-sm">
                      ĐD Phụ trách dược
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="font-bold text-[14px] uppercase mb-6 underline decoration-1 underline-offset-4">
                  KHOA DƯỢC
                </p>
                <div className="flex justify-around gap-4">
                  <div className="flex-1 flex flex-col items-center">
                    <p className="font-bold mb-20 uppercase text-xs md:text-sm">
                      Nhân viên kiểm kê
                    </p>
                    <p className="font-bold text-[14px]">
                      {metaData.members[1]?.name}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <p className="font-bold mb-20 uppercase text-xs md:text-sm">
                      Trưởng khoa dược
                    </p>
                    <p className="font-bold text-[14px]">
                      {metaData.members[0]?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SEARCH THUỐC */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-xl shrink-0">
              <h3 className="font-bold text-sm md:text-base">
                Chọn thuốc vào dòng {currentRow + 1}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X />
              </button>
            </div>
            <div className="p-3 border-b relative shrink-0">
              <Search
                className="absolute left-6 top-5.5 text-gray-400"
                size={20}
              />
              <input
                ref={searchInputRef}
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tìm tên thuốc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-auto p-2">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-2">Tên thuốc</th>
                    <th className="p-2 w-16">ĐVT</th>
                    <th className="p-2 w-16 text-right">Tồn</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrugs.length > 0 ? (
                    filteredDrugs.map((d) => (
                      <tr
                        key={d.id}
                        onClick={() => selectDrug(d)}
                        className="hover:bg-blue-50 cursor-pointer border-b"
                      >
                        <td className="p-2 font-medium">{d.TenDP}</td>
                        <td className="p-2 text-gray-500">{d.DVT}</td>
                        <td className="p-2 text-right font-mono">{d.TonHT}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-400">
                        Không tìm thấy thuốc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COMPONENT IN ẨN */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <PrintView
          ref={printRef}
          dateParts={dateParts}
          timeParts={timeParts}
          metaData={metaData}
          inventoryItems={inventoryItems}
          proposal={proposal}
        />
      </div>
    </div>
  );
};

export default InventorySheet;
