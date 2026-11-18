/** 115000 -> "115,000 ₫" — dùng chung cho mọi trang để format tiền giống nhau */
export const vnd = (n: number) => `${n.toLocaleString('en-US')} ₫`
