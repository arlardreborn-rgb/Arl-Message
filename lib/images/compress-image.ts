import imageCompression from 'browser-image-compression'

export async function compressAvatar(file: File) {
  return imageCompression(file, {
    maxSizeMB: 0.2,           // ~200 KB
    maxWidthOrHeight: 512,
    useWebWorker: true,
    initialQuality: 0.82,
    fileType: 'image/jpeg',
  })
}

export async function compressChatImage(file: File) {
  return imageCompression(file, {
    maxSizeMB: 0.9,           // ~900 KB
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    initialQuality: 0.84,
    fileType: 'image/jpeg',
  })
}