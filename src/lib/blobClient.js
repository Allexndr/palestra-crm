export async function uploadBlobFile(file, scope = 'media') {
  if (!file) return '';

  const response = await fetch('/api/blob/upload', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-File-Name': file.name,
      'X-Upload-Scope': scope,
    },
    body: file,
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
