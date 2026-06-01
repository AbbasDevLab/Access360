/**
 * Downscale + JPEG-compress an image data URL so it fits in the visit's
 * `imagePath` column (the API stores a JSON `{front, back}` string).
 *
 * CNIC photos straight from a phone camera can be 1–2 MB of base64 each —
 * far too large for a typical varchar column. ~800px wide at quality 0.6
 * keeps them readable while shrinking each side to ~40–80 KB.
 */
export async function compressImageDataUrl(
  dataUrl: string,
  options: { maxWidth?: number; quality?: number } = {},
): Promise<string> {
  const { maxWidth = 800, quality = 0.6 } = options
  if (!dataUrl) return dataUrl
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Failed to load image for compression'))
      i.src = dataUrl
    })
    const scale = img.width > maxWidth ? maxWidth / img.width : 1
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return dataUrl
    ctx.drawImage(img, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', quality)
  } catch {
    return dataUrl
  }
}
