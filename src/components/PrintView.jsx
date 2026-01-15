import React from "react";

const PrintView = React.forwardRef((props, ref) => {
  const { dateParts, timeParts, metaData, inventoryItems, proposal } = props;

  // 1. Style chung cho các ô trong bảng
  const cellStyle = {
    border: "1px solid #000",
    padding: "4px 4px 10px 4px", // Tăng padding một chút cho thoáng
    verticalAlign: "middle",
    fontSize: "11pt",
    // QUAN TRỌNG: Các thuộc tính giúp wrap text khi quá dài
    whiteSpace: "normal",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    wordBreak: "break-word",
    lineHeight: "1.2", // Giãn dòng nhẹ cho dễ đọc trong bảng
  };

  const headerCellStyle = {
    ...cellStyle,
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
    // 2. Tăng khoảng cách title với border bottom
    paddingBottom: "8px",
  };

  const underlinedStyle = {
    display: "inline-block",
    borderBottom: "1px solid #000",
    paddingBottom: "10px", // Giảm padding bottom gạch chân cho gọn
    lineHeight: "1",
    marginBottom: "3px",
  };

  // Tính số lượng khoản có dữ liệu
  const validItemsCount = inventoryItems.filter((item) => item.name).length;

  return (
    <div ref={ref}>
      <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm 15mm 10mm 20mm; /* Tinh chỉnh lề để tối đa diện tích: Trên - Phải - Dưới - Trái */
        }
        @media print {
          html, body {
            height: auto;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact; 
          }
          .print-container {
            width: 100%;
            margin: 0;
            padding: 0;
          }
          /* Đảm bảo các dòng trong bảng không bị ngắt đôi trang nếu có thể tránh */
          tr {
             page-break-inside: avoid;
             page-break-after: auto;
          }
          /* Class chuyên dụng để chống ngắt trang cho khối chữ ký */
          .no-break-block {
             page-break-inside: avoid !important;
             break-inside: avoid !important;
             display: block; /* Đảm bảo block level */
             position: relative;
          }
        }
      `}</style>

      <div
        className="print-container"
        style={{
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: "13pt",
          lineHeight: "1.3",
          color: "#000",
          backgroundColor: "#fff",
          boxSizing: "border-box",
        }}
      >
        {/* === HEADER === */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            alignItems: "flex-start",
          }}
        >
          <div style={{ textAlign: "center", width: "40%" }}>
            <p
              style={{
                margin: 0,
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "11pt",
                marginBottom: "5px",
              }}
            >
              BỆNH VIỆN ĐÀ NẴNG
            </p>
            <div
              style={{
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "11pt",
              }}
            >
              <span style={underlinedStyle}>KHOA DƯỢC</span>
            </div>
          </div>

          <div style={{ textAlign: "center", width: "60%" }}>
            <p
              style={{
                margin: 0,
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "11pt",
                marginBottom: "5px",
              }}
            >
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <div style={{ fontWeight: "bold", fontSize: "12pt" }}>
              <span style={underlinedStyle}>Độc lập - Tự do - Hạnh phúc</span>
            </div>
          </div>
        </div>

        {/* === TITLE === */}
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <h1
            style={{
              fontSize: "16pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              margin: "0 0 5px 0",
            }}
          >
            BIÊN BẢN KIỂM KÊ THUỐC TỦ TRỰC
          </h1>
        </div>

        {/* === NGÀY GIỜ === */}
        <div style={{ marginBottom: "10px", textAlign: "left" }}>
          <p style={{ margin: 0 }}>
            Hôm nay, ngày{" "}
            <span style={{ fontWeight: "bold" }}>
              {dateParts.day || "....."}
            </span>{" "}
            tháng{" "}
            <span style={{ fontWeight: "bold" }}>
              {dateParts.month || "....."}
            </span>{" "}
            năm{" "}
            <span style={{ fontWeight: "bold" }}>
              {dateParts.year || "....."}
            </span>
            , tại khoa{" "}
            <span style={{ fontWeight: "bold" }}>
              {metaData.department || "...................................."}
            </span>
          </p>
        </div>

        {/* === TỔ KIỂM KÊ === */}
        <div style={{ marginBottom: "10px" }}>
          <p style={{ margin: "5px 0" }}>Tổ kiểm kê gồm có:</p>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "none",
            }}
          >
            <tbody>
              {metaData.members.map((member, index) => (
                <tr key={index}>
                  <td
                    style={{
                      width: "30px",
                      verticalAlign: "top",
                      border: "none",
                      padding: "2px 0",
                    }}
                  >
                    {index + 1}.
                  </td>
                  <td
                    style={{
                      width: "220px",
                      fontWeight: "bold",
                      border: "none",
                      padding: "2px 0",
                    }}
                  >
                    {member.name ||
                      "................................................"}
                  </td>
                  <td style={{ border: "none", padding: "2px 0" }}>
                    - {member.role}
                  </td>
                  <td
                    style={{
                      width: "100px",
                      textAlign: "left",
                      border: "none",
                      padding: "2px 0",
                      //   fontStyle: "italic",
                    }}
                  >
                    - {member.title}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* === THỜI GIAN THỰC HIỆN === */}
        <div style={{ marginBottom: "10px" }}>
          <p style={{ margin: "5px 0", textAlign: "justify" }}>
            Đã tiến hành kiểm kê thuốc tủ trực tại khoa{" "}
            <span style={{ fontWeight: "bold" }}>
              {metaData.department || "...................."}
            </span>{" "}
            từ{" "}
            <span style={{ fontWeight: "bold" }}>
              {timeParts.startH || "..."}
            </span>{" "}
            giờ{" "}
            <span style={{ fontWeight: "bold" }}>
              {timeParts.startM || "..."}
            </span>{" "}
            đến{" "}
            <span style={{ fontWeight: "bold" }}>
              {timeParts.endH || "..."}
            </span>{" "}
            giờ{" "}
            <span style={{ fontWeight: "bold" }}>
              {timeParts.endM || "..."}
            </span>
          </p>
          <p style={{ margin: "8px 0 5px 0" }}>- Kết quả như sau:</p>
        </div>

        {/* === BẢNG DỮ LIỆU === */}
        {/* Sử dụng table-layout: fixed nếu muốn kiểm soát chiều rộng cột tuyệt đối, nhưng ở đây dùng auto + width % sẽ linh hoạt hơn */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "15px",
            tableLayout: "auto",
          }}
        >
          <thead>
            <tr>
              {/* STT: Giữ nguyên 30px */}
              <th style={{ ...headerCellStyle, width: "30px" }} rowSpan="2">
                Stt
              </th>

              {/* QUAN TRỌNG: Set width khoảng 25-30% hoặc px cụ thể để ép cột Tên thuốc hẹp lại
                  Nó sẽ tự xuống dòng (wrap text) vì bạn đã có wordBreak trong cellStyle */}
              <th style={{ ...headerCellStyle, width: "25%" }} rowSpan="2">
                Tên thuốc, nồng độ, hàm lượng
              </th>

              <th style={{ ...headerCellStyle, width: "40px" }} rowSpan="2">
                Đvt
              </th>

              {/* THÊM minWidth: Đảm bảo khi in PDF không bị co nhỏ dưới 90px */}
              <th
                style={{ ...headerCellStyle, width: "90px", minWidth: "90px" }}
                rowSpan="2"
              >
                Số kiểm soát
              </th>

              {/* THÊM minWidth: 75px */}
              <th
                style={{ ...headerCellStyle, width: "75px", minWidth: "75px" }}
                rowSpan="2"
              >
                Nước SX
              </th>

              {/* THÊM minWidth: 75px */}
              <th
                style={{ ...headerCellStyle, width: "75px", minWidth: "75px" }}
                rowSpan="2"
              >
                Hạn dùng
              </th>

              <th style={headerCellStyle} colSpan="2">
                Số lượng
              </th>
              <th style={{ ...headerCellStyle, width: "40px" }} rowSpan="2">
                Hỏng vỡ
              </th>
              <th style={{ ...headerCellStyle, width: "60px" }} rowSpan="2">
                Ghi chú
              </th>
            </tr>
            <tr>
              <th style={{ ...headerCellStyle, width: "40px" }}>Sổ sách</th>
              <th style={{ ...headerCellStyle, width: "40px" }}>Thực tế</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems
              .filter((item) => item.name)
              .map((item, index) => (
                <tr key={item.id}>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {index + 1}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "left" }}>
                    {item.name}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {item.unit}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {item.controlNo || ""}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {item.country || ""}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {item.expiry || ""}
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {item.stockBook || 0}
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {item.stockReal || 0}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {item.broken || ""}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {item.note || ""}
                  </td>
                </tr>
              ))}

            {/* Nếu không có dữ liệu */}
            {validItemsCount === 0 && (
              <tr>
                <td
                  colSpan={10}
                  style={{ ...cellStyle, textAlign: "center", padding: "15px" }}
                >
                  (Không có dữ liệu thuốc)
                </td>
              </tr>
            )}

            {/* 3. DÒNG CỘNG KHOẢN (Đã đưa vào trong Table) */}
            <tr>
              {/* 1. Ô STT để trống nhưng vẫn có border */}
              <td style={cellStyle}></td>

              {/* 2. Ô chứa nội dung "Cộng khoản" gộp 9 cột còn lại */}
              <td
                colSpan={9}
                style={{
                  ...cellStyle,
                  fontWeight: "bold",
                  textAlign: "left",
                  padding: "8px 5px",
                }}
              >
                Cộng khoản:{" "}
                {validItemsCount < 10 ? `${validItemsCount}` : validItemsCount}{" "}
                khoản
              </td>
            </tr>
          </tbody>
        </table>

        {/* === Ý KIẾN ĐỀ XUẤT === */}
        <div style={{ marginBottom: "10px" }}>
          <div>
            <span
              style={{
                fontWeight: "bold",
                fontStyle: "italic",
                ...underlinedStyle,
                border: "none",
              }}
            >
              Ý kiến đề xuất:
            </span>
          </div>
          <div
            style={{
              marginTop: "5px",
              minHeight: "40px",
              lineHeight: "1.5",
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
              width: "100%",
              fontSize: "12pt",
            }}
          >
            {proposal ||
              "......................................................................................................................................................................................................................................................................................................................................................................."}
          </div>
        </div>

        {/* --- PHẦN CHỮ KÝ (FOOTER) - ĐÃ SỬA LẠI --- */}
        <div
          style={{
            marginTop: "20px",
            width: "98%", // Thu nhỏ lại chút để tránh chạm mép phải
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* Hàng 1: Tiêu đề Khoa Phòng - Khoa Dược */}
          <div style={{ display: "flex", width: "100%", marginBottom: "10px" }}>
            {/* Bên trái: Khoa Phòng (Chiếm 50% - bao gồm 2 cột đầu) */}
            <div style={{ width: "50%", textAlign: "center" }}>
              <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                KHOA PHÒNG
              </div>
            </div>
            {/* Bên phải: Khoa Dược (Chiếm 50% - bao gồm 2 cột sau) */}
            <div style={{ width: "50%", textAlign: "center" }}>
              <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                <span>KHOA DƯỢC</span>
              </div>
            </div>
          </div>

          {/* Hàng 2: 4 Chức danh nằm thẳng hàng */}
          <div style={{ display: "flex", width: "100%" }}>
            {/* Cột 1: Điều dưỡng trưởng */}
            <div
              style={{
                width: "25%",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "11pt",
              }}
            >
              ĐIỀU DƯỠNG TRƯỞNG
            </div>
            {/* Cột 2: ĐD Phụ trách */}
            <div
              style={{
                width: "25%",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "11pt",
              }}
            >
              ĐD PHỤ TRÁCH DƯỢC
            </div>
            {/* Cột 3: NV Kiểm kê */}
            <div
              style={{
                width: "25%",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "11pt",
              }}
            >
              NHÂN VIÊN KIỂM KÊ
            </div>
            {/* Cột 4: Trưởng khoa dược */}
            <div
              style={{
                width: "25%",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "11pt",
              }}
            >
              TRƯỞNG KHOA DƯỢC
            </div>
          </div>

          {/* Khoảng trống để ký tên */}
          <div style={{ height: "100px" }}></div>

          {/* Hàng 3: Tên người ký (Tương ứng 4 cột trên) */}
          <div
            style={{ display: "flex", width: "100%", paddingBottom: "20px" }}
          >
            {/* Tên Cột 1 */}
            <div
              style={{ width: "25%", textAlign: "center", fontWeight: "bold" }}
            >
              {/*{metaData.members[2]?.name}*/} {/* Điều dưỡng trưởng */}
            </div>
            {/* Tên Cột 2 */}
            <div
              style={{ width: "25%", textAlign: "center", fontWeight: "bold" }}
            >
              {/*{metaData.members[3]?.name}*/} {/* ĐD Phụ trách */}
            </div>
            {/* Tên Cột 3 */}
            <div
              style={{ width: "25%", textAlign: "center", fontWeight: "bold" }}
            >
              {metaData.members[1]?.name} {/* Nguyễn Thị Nhàn */}
            </div>
            {/* Tên Cột 4 - Đã xử lý căn chỉnh để không bị cắt */}
            <div
              style={{ width: "25%", textAlign: "center", fontWeight: "bold" }}
            >
              {metaData.members[0]?.name} {/* Trần Thị Đảm */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrintView;
