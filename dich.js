/**
 * Dịch
 *
 * Input: text bất kỳ (số điện thoại, email, domain, v.v.)
 * - Loại bỏ ký tự không phải [0-9A-Za-z]
 * - Dùng base 36
 * - Chia đôi chuỗi để tính:
 *   - Thượng quái từ tổng nửa trái
 *   - Hạ quái từ tổng nửa phải
 *   - Hào động từ tổng cả hai nửa
 * - Suy ra:
 *   - Tên quẻ chủ (Quẻ)
 *   - Tên quẻ biến (QueBien) bằng cách đổi hào động trong bát quái
 */

const QUE8 = ["Thiên", "Trạch", "Hỏa", "Lôi", "Phong", "Thủy", "Sơn", "Địa"];

// Bảng 64 quẻ theo (thượng, hạ)
// Key: "thuong,ha"
const QUE64 = {
  // Thượng Thiên (1)
  "1,1": "Thuần Càn",
  "1,2": "Thiên Trạch Lý",
  "1,3": "Thiên Hỏa Đồng Nhân",
  "1,4": "Thiên Lôi Vô Vọng",
  "1,5": "Thiên Phong Cấu",
  "1,6": "Thiên Thủy Tụng",
  "1,7": "Thiên Sơn Độn",
  "1,8": "Thiên Địa Bĩ",

  // Thượng Trạch (2)
  "2,1": "Trạch Thiên Quải",
  "2,2": "Thuần Đoài",
  "2,3": "Trạch Hỏa Cách",
  "2,4": "Trạch Lôi Tùy",
  "2,5": "Trạch Phong Đại Quá",
  "2,6": "Trạch Thủy Khốn",
  "2,7": "Trạch Sơn Hàm",
  "2,8": "Trạch Địa Tụy",

  // Thượng Hỏa (3)
  "3,1": "Hỏa Thiên Đại Hữu",
  "3,2": "Hỏa Trạch Khuê",
  "3,3": "Thuần Ly",
  "3,4": "Hỏa Lôi Phệ Hạp",
  "3,5": "Hỏa Phong Đỉnh",
  "3,6": "Hỏa Thủy Vị Tế",
  "3,7": "Hỏa Sơn Lữ",
  "3,8": "Hỏa Địa Tấn",

  // Thượng Lôi (4)
  "4,1": "Lôi Thiên Đại Tráng",
  "4,2": "Lôi Trạch Quy Muội",
  "4,3": "Lôi Hỏa Phong",
  "4,4": "Thuần Chấn",
  "4,5": "Lôi Phong Hằng",
  "4,6": "Lôi Thủy Giải",
  "4,7": "Lôi Sơn Tiểu Quá",
  "4,8": "Lôi Địa Dự",

  // Thượng Phong (5)
  "5,1": "Phong Thiên Tiểu Súc",
  "5,2": "Phong Trạch Trung Phu",
  "5,3": "Phong Hỏa Gia Nhân",
  "5,4": "Phong Lôi Ích",
  "5,5": "Thuần Tốn",
  "5,6": "Phong Thủy Hoán",
  "5,7": "Phong Sơn Tiệm",
  "5,8": "Phong Địa Quán",

  // Thượng Thủy (6)
  "6,1": "Thủy Thiên Nhu",
  "6,2": "Thủy Trạch Tiết",
  "6,3": "Thủy Hỏa Ký Tế",
  "6,4": "Thủy Lôi Truân",
  "6,5": "Thủy Phong Tỉnh",
  "6,6": "Thuần Khảm",
  "6,7": "Thủy Sơn Kiển",
  "6,8": "Thủy Địa Tỷ",

  // Thượng Sơn (7)
  "7,1": "Sơn Thiên Đại Súc",
  "7,2": "Sơn Trạch Tổn",
  "7,3": "Sơn Hỏa Bí",
  "7,4": "Sơn Lôi Di",
  "7,5": "Sơn Phong Cổ",
  "7,6": "Sơn Thủy Mông",
  "7,7": "Thuần Cấn",
  "7,8": "Sơn Địa Bác",

  // Thượng Địa (8)
  "8,1": "Địa Thiên Thái",
  "8,2": "Địa Trạch Lâm",
  "8,3": "Địa Hỏa Minh Di",
  "8,4": "Địa Lôi Phục",
  "8,5": "Địa Phong Thăng",
  "8,6": "Địa Thủy Sư",
  "8,7": "Địa Sơn Khiêm",
  "8,8": "Thuần Khôn",
};

// Ánh xạ bát quái -> nhị phân (3 hào, 1 = dương, 0 = âm)
// Thiên=111, Trạch=110, Hỏa=101, Lôi=100, Phong=011, Thủy=010, Sơn=001, Địa=000
const TRIGRAM_TO_BINARY = { 1: 7, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 0 };
const BINARY_TO_TRIGRAM = Object.fromEntries(
  Object.entries(TRIGRAM_TO_BINARY).map(([k, v]) => [v, Number(k)]),
);


function removeVietnameseAccents(str) {
  if (["Thuần Càn", "Thuần Cấn"].includes(str)) return str;
  // Normalize the string to NFD (Normalization Form Decomposition)
  // This breaks characters like 'é' into 'e' and the accent mark
  str = str.normalize("NFD");

  // Use a regular expression to remove the accent marks (combining diacritical marks range)
  str = str.replace(/[\u0300-\u036f]/g, "");
  
  // The normalization process doesn't convert the Vietnamese 'đ' to 'd'.
  // We add a specific replacement for this case.
  str = str.replace(/đ/g, "d").replace(/Đ/g, "D");

  return str;
}

/**
 *
 * @param {string} text
 * @param {number} [base=10]
 * @returns {{
 *   Ma: string,
 *   ThuongQuai: string,
 *   HaQuai: string,
 *   HaoDong: number|null,
 *   Que: string,
 *   QueBien: string
 * }}
 */
function dich(text) {
  const raw = String(text);
  const number = raw.replace(/[^0-9A-Za-z]/g, "");

  let usedBase = 36;

  let left = 0;
  let right = 0;
  const mid = Math.floor((number.length + 1) / 2);

  for (let i = 0; i < mid; i += 1) {
    left += parseInt(number[i], usedBase);
  }
  for (let i = mid; i < number.length; i += 1) {
    right += parseInt(number[i], usedBase);
  }

  let queThuong = left % 8;
  if (queThuong === 0) queThuong = 8;

  let queHa = right % 8;
  if (queHa === 0) queHa = 8;

  let haoDong = (left + right) % 6;
  if (haoDong === 0) haoDong = 6;

  const tenThuong = QUE8[queThuong - 1];
  const tenHa = QUE8[queHa - 1];
  const tenQue = QUE64[`${queThuong},${queHa}`] ?? `${tenThuong} ${tenHa}`;

  // Tính quẻ biến bằng cách đổi hào động
  let upperBinary = TRIGRAM_TO_BINARY[queThuong];
  let lowerBinary = TRIGRAM_TO_BINARY[queHa];

  if (haoDong <= 3) {
    // Biến ở hạ quái — hào 1,2,3 (từ dưới lên)
    const bitPos = 3 - haoDong; // 1→2, 2→1, 3→0
    lowerBinary ^= 1 << bitPos;
  } else {
    // Biến ở thượng quái — hào 4,5,6 (từ dưới lên)
    const bitPos = 6 - haoDong; // 4→2, 5→1, 6→0
    upperBinary ^= 1 << bitPos;
  }

  const newQueThuong = BINARY_TO_TRIGRAM[upperBinary];
  const newQueHa = BINARY_TO_TRIGRAM[lowerBinary];
  const tenQueBien =
    QUE64[`${newQueThuong},${newQueHa}`] ?? "Invalid";

  return {
    Ma: `${queThuong}${queHa}${haoDong}`,
    ThuongQuai: tenThuong,
    HaQuai: tenHa,
    HaoDong: haoDong || null,
    Que: tenQue,
    QueBien: tenQueBien,
    QueNoAccents: removeVietnameseAccents(tenQue).toLowerCase().replace(/ /g, "-"),
    QueBienNoAccents: removeVietnameseAccents(tenQueBien).toLowerCase().replace(/ /g, "-"),
  };
}


if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = {
    dich,
    QUE8,
    QUE64,
  };
} else {
  const globalScope =
    typeof window !== "undefined"
      ? window
      : typeof globalThis !== "undefined"
        ? globalThis
        : {};

  globalScope.dich = dich;
  globalScope.QUE8 = QUE8;
  globalScope.QUE64 = QUE64;
}

