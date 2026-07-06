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
    <label className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-zinc-300 rounded-md cursor-pointer hover:bg-zinc-50 transition-colors">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      {uploading ? (
        <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
      ) : (
        <svg
          className="w-4 h-4 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      )}
      <span className="text-zinc-600">
        {uploading ? "Uploading..." : "Upload Image"}
      </span>
    </label>
  );
}
