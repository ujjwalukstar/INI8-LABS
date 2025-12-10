import React, { useRef } from 'react';

export default function UploadForm({ apiUrl, onSuccess, setMessage }) {
  const fileRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const file = fileRef.current.files[0];
    if (!file) {
      setMessage('Select a PDF file first');
      return;
    }
    if (file.type !== 'application/pdf') {
      setMessage('Only PDF files allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB client-side check
      setMessage('File too large (max 10MB)');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${apiUrl}/documents/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        onSuccess('Upload successful');
        fileRef.current.value = null;
      } else {
        const err = await res.json();
        setMessage(err.error || 'Upload failed');
      }
    } catch (err) {
      setMessage('Upload error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <label>
        Choose PDF:
        <input ref={fileRef} type="file" accept="application/pdf" />
      </label>
      <button type="submit">Upload</button>
    </form>
  );
}
