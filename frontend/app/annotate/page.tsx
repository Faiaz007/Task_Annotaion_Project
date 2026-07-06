"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import ImageUploader from "@/components/annotate/ImageUploader";
import ImageFilmstrip from "@/components/annotate/ImageFilmstrip";
import AnnotationCanvas from "@/components/annotate/AnnotationCanvas";
import Sidebar from "@/components/Sidebar";

interface ImageData {
  id: number;
  image: string;
  original_filename: string;
  width: number | null;
  height: number | null;
  polygons: {
    id: number;
    points: [number, number][];
    color: string;
    label: string;
  }[];
}

export default function AnnotatePage() {
  const router = useRouter();
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("auth-storage");
    if (!stored) {
      router.push("/login");
    }
  }, [router]);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/images/");
      setImages(data);
      setLoading(false);
    } catch {
      setError("Failed to load images");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const selectedImage = images.find((img) => img.id === selectedId) || images[0] || null;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(15,17,23,0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Image Annotation</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {images.length} image{images.length !== 1 ? "s" : ""} uploaded
            </p>
          </div>
          <ImageUploader onUploaded={fetchImages} />
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col p-6 overflow-auto">
          {/* Filmstrip */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Images
              </span>
              {images.length > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(79,142,247,0.15)", color: "#4f8ef7" }}
                >
                  {images.length}
                </span>
              )}
            </div>
            <ImageFilmstrip
              images={images}
              selectedId={selectedImage?.id ?? null}
              onSelect={setSelectedId}
            />
          </div>

          {/* Main content area */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="spinner" />
            </div>
          )}

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-lg animate-fade-in"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && images.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 empty-state" style={{ minHeight: "300px" }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)" }}
              >
                <svg width="28" height="28" fill="none" stroke="#4f8ef7" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No images yet</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Upload an image to start annotating</p>
              </div>
            </div>
          )}

          {!loading && !error && selectedImage && (
            <div className="animate-fade-in">
              {/* Image meta info */}
              <div
                className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-lg text-xs"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(to bottom, #4f8ef7, #a78bfa)" }} />
                <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                  {selectedImage.original_filename}
                </span>
                {selectedImage.width && selectedImage.height && (
                  <span style={{ color: "var(--text-muted)" }}>
                    {selectedImage.width} × {selectedImage.height}px
                  </span>
                )}
                <span
                  className="ml-auto px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}
                >
                  {selectedImage.polygons.length} polygon{selectedImage.polygons.length !== 1 ? "s" : ""}
                </span>
              </div>

              <AnnotationCanvas
                key={selectedImage.id}
                image={selectedImage}
                onPolygonsChanged={fetchImages}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
