export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getFileIcon = (ext: string | null): string => {
  if (!ext) return 'lucide:file'
  const map: Record<string, string> = {
    png: 'lucide:image', jpg: 'lucide:image', jpeg: 'lucide:image', gif: 'lucide:image', webp: 'lucide:image',
    pdf: 'lucide:file-text',
    doc: 'lucide:file-text', docx: 'lucide:file-text',
    xls: 'lucide:file-spreadsheet', xlsx: 'lucide:file-spreadsheet',
    mp4: 'lucide:file-video', mkv: 'lucide:file-video', avi: 'lucide:file-video', mov: 'lucide:file-video',
    mp3: 'lucide:file-audio', wav: 'lucide:file-audio', flac: 'lucide:file-audio',
    zip: 'lucide:file-archive', rar: 'lucide:file-archive', '7z': 'lucide:file-archive'
  }
  return map[ext.toLowerCase()] || 'lucide:file'
}

export const getIconColor = (ext: string | null): string => {
  const colorMap: Record<string, string> = {
    pdf: 'text-red-600 bg-red-50 dark:bg-red-900/30',
    doc: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
    docx: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
    xls: 'text-green-600 bg-green-50 dark:bg-green-900/30',
    xlsx: 'text-green-600 bg-green-50 dark:bg-green-900/30',
    jpg: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    jpeg: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    png: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    gif: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    webp: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    mp4: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    mkv: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    avi: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    mov: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
    mp3: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
    wav: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
    flac: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
    zip: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
    rar: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
    '7z': 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
  }
  return colorMap[ext?.toLowerCase() || ''] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
}

export const getExpiryColor = (dateStr: string): string => {
  const now = new Date()
  const expiry = new Date(dateStr)
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 3) return 'text-red-500 font-semibold'
  if (diffDays <= 7) return 'text-orange-500'
  return 'text-muted-foreground'
}

export const getExpiryDistance = (dateStr: string | null): string => {
   if (!dateStr) return '';
   const now = new Date();
   const expiry = new Date(dateStr);
   const diffTime = expiry.getTime() - now.getTime();
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
   
   if (diffDays < 0) return 'Expired';
   if (diffDays === 0) return 'Expires today';
   if (diffDays === 1) return 'Expires tomorrow';
   return `${diffDays} days left`;
}

export const isVideoFile = (ext: string | null): boolean => {
  if (!ext) return false
  return ['mp4', 'mkv', 'avi', 'mov', 'webm', 'wmv', 'flv'].includes(ext.toLowerCase())
}

export const isArchiveFile = (ext: string | null): boolean => {
  if (!ext) return false
  return ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext.toLowerCase())
}

export const isImageFile = (ext: string | null): boolean => {
  if (!ext) return false
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext.toLowerCase())
}

export const isAudioFile = (ext: string | null): boolean => {
  if (!ext) return false
  return ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(ext.toLowerCase())
}
