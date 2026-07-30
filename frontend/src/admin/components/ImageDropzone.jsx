import { useState } from 'react';

export default function ImageDropzone({ label, currentImageUrl, onFileSelected }) {
  const [preview, setPreview] = useState(currentImageUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    onFileSelected(file);
    setLoadFailed(false);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="form-field">
      {label && <label>{label}</label>}
      <div
        className={`image-dropzone${dragActive ? ' image-dropzone--active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {preview && !loadFailed && (
          <img
            src={preview}
            alt="Preview"
            className="image-dropzone__preview"
            onError={() => setLoadFailed(true)}
          />
        )}
        {preview && loadFailed && (
          <p className="image-dropzone__error">
            Image failed to load — the file may not be publicly accessible at its stored URL.
          </p>
        )}
        <p className="image-dropzone__hint">
          {preview ? 'Drop a new image or click to replace' : 'Drag & drop an image here, or click to browse'}
        </p>
        <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}
