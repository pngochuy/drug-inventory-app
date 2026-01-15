import React from "react";

const PrintView = React.forwardRef((props, ref) => {
  const { dateParts, timeParts, metaData, inventoryItems, proposal } = props;

  // 1. Style chung cho các ô trong bảng
  const cellStyle = {
    border: "1px solid #000",
    padding: "3px 2px",
    verticalAlign: "middle",
    fontSize: "11pt",
    whiteSpace: "normal",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    wordBreak: "break-word",
    lineHeight: "1.2",
  };

  const headerCellStyle = {
    ...cellStyle,
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
    paddingBottom: "8px",
  };

  const underlinedStyle = {
    display: "inline-block",
    borderBottom: "1px solid #000",
    paddingBottom: "10px",
    lineHeight: "1",
    marginBottom: "3px",
  };

  // Tính số lượng khoản có dữ liệu (để hiển thị ở Cộng khoản)
  const validItemsCount = inventoryItems.filter((item) => item.name).length;

  return (
    <div ref={ref}>
      <div
        className="print-container"
        style={{
          padding: "20px 40px",
          fontFamily: "Times New Roman, serif",
          color: "#000",
          fontSize: "12pt",
          lineHeight: "1.5",
        }}
      >
        {/* === HEADER (GIỮ NGUYÊN) === */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ textAlign: "center", width: "40%" }}>
            <p style={{ margin: 0, fontWeight: "bold" }}>BỆNH VIỆN ĐÀ NẴNG</p>
            <p
              style={{
                margin: 0,
                fontWeight: "bold",
                textDecoration: "underline",
              }}
            >
              KHOA DƯỢC
            </p>
          </div>
          <div style={{ textAlign: "center", width: "60%" }}>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p
              style={{
                margin: 0,
                fontWeight: "bold",
                textDecoration: "underline",
              }}
            >
              Độc lập - Tự do - Hạnh phúc
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2
            style={{
              margin: "0 0 10px 0",
              fontWeight: "bold",
              fontSize: "16pt",
            }}
          >
            BIÊN BẢN KIỂM KÊ THUỐC TỦ TRỰC
          </h2>
          <p style={{ margin: 0, fontStyle: "italic" }}>
            Hôm nay, ngày {dateParts.day} tháng {dateParts.month} năm{" "}
            {dateParts.year}, tại {metaData.department}
          </p>
        </div>

        {/* THÔNG TIN TỔ KIỂM KÊ (GIỮ NGUYÊN) */}
        <div style={{ marginBottom: "15px" }}>
          <p style={{ margin: "0 0 5px 0" }}>Tổ kiểm kê gồm có:</p>
          <table
            style={{ width: "100%", border: "none", marginBottom: "10px" }}
          >
            <tbody>
              {metaData.members.map((member, index) => (
                <tr key={index}>
                  <td style={{ width: "30px", verticalAlign: "top" }}>
                    {index + 1}.
                  </td>
                  <td
                    style={{
                      width: "250px",
                      fontWeight: "bold",
                      verticalAlign: "top",
                    }}
                  >
                    {member.name}
                  </td>
                  <td style={{ verticalAlign: "top" }}>
                    - {member.role}
                    {member.title && (
                      <>
                        <br />- {member.title}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ margin: "5px 0" }}>
            Đã tiến hành kiểm kê thuốc tủ trực tại {metaData.department} từ{" "}
            {timeParts.startH} giờ {timeParts.startM} đến {timeParts.endH} giờ{" "}
            {timeParts.endM}.
          </p>
          <p style={{ margin: "5px 0" }}>- Kết quả như sau:</p>
        </div>

        {/* === BẢNG DỮ LIỆU === */}
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
              <th style={{ ...headerCellStyle, width: "30px" }} rowSpan="2">
                Stt
              </th>

              {/* Width 25% để tên thuốc không quá rộng */}
              <th style={{ ...headerCellStyle, width: "25%" }} rowSpan="2">
                Tên thuốc, nồng độ, hàm lượng
              </th>

              <th style={{ ...headerCellStyle, width: "40px" }} rowSpan="2">
                Đvt
              </th>

              {/* minWidth để cột không bị ép nhỏ khi in */}
              <th
                style={{ ...headerCellStyle, width: "90px", minWidth: "90px" }}
                rowSpan="2"
              >
                Số kiểm soát
              </th>
              <th
                style={{ ...headerCellStyle, width: "75px", minWidth: "75px" }}
                rowSpan="2"
              >
                Nước SX
              </th>
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
            {inventoryItems.map((item, index) => (
              <tr key={item.id || index}>
                <td style={{ ...cellStyle, textAlign: "center" }}>
                  {item.name ? index + 1 : ""}
                </td>
                <td style={{ ...cellStyle, textAlign: "left" }}>{item.name}</td>
                <td style={{ ...cellStyle, textAlign: "center" }}>
                  {item.unit}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.batch}
                </td>
                <td style={{ ...cellStyle, textAlign: "center" }}>
                  {item.country}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.expiry}
                </td>
                <td style={{ ...cellStyle, textAlign: "center" }}>
                  {item.stockBook}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {item.stockReal}
                </td>
                <td style={{ ...cellStyle, textAlign: "center" }}>
                  {item.damaged}
                </td>
                <td style={{ ...cellStyle, textAlign: "center" }}>
                  {item.notes}
                </td>
              </tr>
            ))}

            {/* === DÒNG CỘNG KHOẢN (ĐÃ SỬA THEO YÊU CẦU) === */}
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
                  paddingLeft: "10px", // Thụt vào một chút cho đẹp
                }}
              >
                Cộng khoản:{" "}
                {validItemsCount < 10 ? `0${validItemsCount}` : validItemsCount}{" "}
                khoản
              </td>
            </tr>
          </tbody>
        </table>

        {/* === PHẦN Ý KIẾN ĐỀ XUẤT (ĐÃ SỬA THEO YÊU CẦU) === */}
        <div style={{ marginBottom: "20px" }}>
          {/* Dùng Flexbox để text và dòng chấm nằm cùng hàng */}
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <span
              style={{
                fontWeight: "bold",
                marginRight: "10px",
                whiteSpace: "nowrap",
              }}
            >
              - Ý kiến đề xuất:
            </span>
            {/* div này sẽ tự giãn hết chiều rộng còn lại và có border chấm bên dưới */}
            <div
              style={{
                flexGrow: 1,
                borderBottom: "1px dotted #000", // Tạo nét chấm
                minHeight: "20px",
                paddingLeft: "5px",
              }}
            >
              {proposal} {/* Nếu có nội dung thì hiện ở đây */}
            </div>
          </div>

          {/* Thêm 2 dòng chấm nữa cho giống form giấy (nếu cần viết dài) */}
          <div
            style={{
              borderBottom: "1px dotted #000",
              height: "25px",
              width: "100%",
            }}
          ></div>
          <div
            style={{
              borderBottom: "1px dotted #000",
              height: "25px",
              width: "100%",
            }}
          ></div>
        </div>

        {/* === PHẦN CHỮ KÝ (GIỮ NGUYÊN) === */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontWeight: "bold",
                textTransform: "uppercase",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              <span style={underlinedStyle}>KHOA DƯỢC</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                textAlign: "center",
              }}
            >
              <div style={{ width: "50%" }}>
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "11pt",
                    marginBottom: "80px",
                  }}
                >
                  NHÂN VIÊN KIỂM KÊ
                </p>
                <p style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {metaData.members[1]?.name}
                </p>
              </div>
              <div style={{ width: "50%" }}>
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "11pt",
                    marginBottom: "80px",
                  }}
                >
                  TRƯỞNG KHOA DƯỢC
                </p>
                <p style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {metaData.members[0]?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrintView;
