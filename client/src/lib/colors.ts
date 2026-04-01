export const colorMap: Record<string, string> = {
  blue: "Xanh dương",
  green: "Xanh lá",
  red: "Đỏ",
  yellow: "Vàng",
  purple: "Tím",
  orange: "Cam",
  pink: "Hồng",
  brown: "Nâu",
  gray: "Xám",
  black: "Đen",
  white: "Trắng",
};

export const translateColor = (color: string) => {
  const c = color?.toLowerCase().trim();
  return colorMap[c] || color;
};
