import { useState, useRef } from 'react';

export default function FileDropZone({ onUpload, disabled }) {
  const [dragover, setDragover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleUpload(file);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) await handleUpload(file);
    e.target.value = '';
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`drop-zone ${dragover ? 'dragover' : ''} ${uploading ? 'uploading' : ''}`}
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
      onDragLeave={() => setDragover(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <p>
        {uploading ? '上傳中...' : <>拖曳檔案至此 或 <span className="browse-link">點擊選擇</span></>}
      </p>
    </div>
  );
}
