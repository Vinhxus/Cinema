// DB lưu poster dạng "/assets/dune.png", còn ảnh thật nằm trong fe/src/assets (được Vite bundle).
// import.meta.glob lấy hết ảnh trong thư mục -> map tên file sang URL sau khi build.
const ASSETS = import.meta.glob('../assets/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export function resolvePoster(url: string | null | undefined): string | null {
  if (!url) return null
  if (/^https?:\/\//.test(url)) return url
  const fileName = url.split('/').pop()
  return (fileName && ASSETS[`../assets/${fileName}`]) || null
}
