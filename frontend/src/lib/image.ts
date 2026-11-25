export async function compressProductImage(file: File): Promise<File> {
  if (file.type === "image/webp" && file.size <= 350_000) return file;

  const bitmap = await createImageBitmap(file);
  const maxDimension = 1000;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) { bitmap.close(); throw new Error("Foto tidak bisa diproses di browser ini."); }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.78));
  if (!blob) throw new Error("Foto gagal dikompresi. Coba pilih file gambar lain.");
  const baseName = file.name.replace(/\.[^.]+$/, "") || "foto-produk";
  return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
}
