"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";

interface Props {
  onUploaded: () => void;
}

export default function ImageUploader({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await api.post("/images/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <label
      id="upload-image-btn"
      className="btn-primary"
      style={{ cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.7 : 1 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
      {uploading ? (
        <>
          <div
            className="w-4 h-4 border-2 rounded-full"
            style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.7s linear infinite" }}
          />
          Uploading…
        </>
      ) : (
        <>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Image
        </>
      )}
    </label>
  );
}
