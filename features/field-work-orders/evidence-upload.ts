import { buildApiUrl } from '@/lib/api/config'

export function uploadEvidenceFile(
  uploadPath: string,
  file: Blob,
  contentType: string,
  onProgress: (percentage: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', buildApiUrl(uploadPath))
    request.withCredentials = true
    request.setRequestHeader('Content-Type', contentType)
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })
    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) resolve()
      else reject(new Error('Evidence upload failed.'))
    })
    request.addEventListener('error', () =>
      reject(new Error('Evidence upload failed.')),
    )
    request.send(file)
  })
}
