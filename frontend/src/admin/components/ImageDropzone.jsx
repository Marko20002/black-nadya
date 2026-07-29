import { useState } from 'react';

export default function ImageDropzone({ label, currentImageUrl, onFileSelected }) {
  const [preview, setPreview] = useState(currentImageUrl || null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    onFileSelected(file);
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
        {preview && <img src={preview} alt="Preview" className="image-dropzone__preview" />}
        <p className="image-dropzone__hint">
          {preview ? 'Drop a new image or click to replace' : 'Drag & drop an image here, or click to browse'}
        </p>
        <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}
