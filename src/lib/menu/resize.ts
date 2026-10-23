// Browser-only: re-encodes photos before upload so they load fast on mobile
// data. Re-encoding also drops EXIF data such as GPS position.

export async function resizeImage(file: Blob, maxSide: number, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d")!;
    // JPEG has no transparency: paint transparent areas white, like the menu page.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Image conversion failed"))), "image/jpeg", quality),
    );
  } finally {
    bitmap.close();
  }
}
