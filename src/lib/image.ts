/** Draws an image or video frame scaled so its longest side is `maxSide`, and exports a JPEG. */
export async function toJpeg(
  source: CanvasImageSource & { width?: number; height?: number },
  sourceWidth: number,
  sourceHeight: number,
  maxSide: number,
  quality = 0.85,
): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(sourceWidth * scale))
  canvas.height = Math.max(1, Math.round(sourceHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas unavailable')
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('jpeg export failed'))),
      'image/jpeg',
      quality,
    ),
  )
}

/** Shrinks a user-picked image file (jpeg/png/webp) into a small JPEG. */
export async function fileToJpeg(file: File, maxSide = 512): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  try {
    return await toJpeg(bitmap, bitmap.width, bitmap.height, maxSide)
  } finally {
    bitmap.close()
  }
}

/** Base64 of a blob without the data-URL prefix (what the enrollment RPC expects). */
export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}
