async function compressImage(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) {
  if (!file.type.startsWith('image/')) return file;
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
    };
  });
}

export async function uploadBlobFile(file, scope = 'media') {
  if (!file) return '';

  // Compress if it's an image
  const fileToUpload = file.type.startsWith('image/') ? await compressImage(file) : file;

  const response = await fetch('/api/blob/upload', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': fileToUpload.type || 'application/octet-stream',
      // Fix: encode filename to avoid non-ASCII header error
      'X-File-Name': encodeURIComponent(file.name),
      'X-Upload-Scope': scope,
    },
    body: fileToUpload,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Не удалось загрузить файл');
  }

  return data.url;
}

export async function deleteBlobUrl(url) {
  if (!url) return;
  await fetch('/api/blob/delete', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}
