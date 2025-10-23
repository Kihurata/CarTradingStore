export function formatPriceVND(value: number | string): string {
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  if (isNaN(num) || num <= 0) return "—";

  const billion = Math.floor(num / 1_000_000_000);
  const million = Math.floor((num % 1_000_000_000) / 1_000_000);

  if (billion > 0 && million > 0) {
    return `${billion} tỉ ${million} triệu`;
  } else if (billion > 0) {
    return `${billion} tỉ`;
  } else {
    return `${million} triệu`;
  }
}
