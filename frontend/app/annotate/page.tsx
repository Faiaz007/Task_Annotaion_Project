"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import ImageUploader from "@/components/annotate/ImageUploader";
import ImageFilmstrip from "@/components/annotate/ImageFilmstrip";
import AnnotationCanvas from "@/components/annotate/AnnotationCanvas";
import Link from "next/link";

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
    <div className="flex-1 flex flex-col p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-800">Annotation Tool</h1>
        <Link
          href="/tasks"
          className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          &larr; Tasks
        </Link>
      </div>

      <div className="mb-4">
        <ImageUploader onUploaded={fetchImages} />
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-medium text-zinc-500 mb-2">Uploaded Images</h2>
        <ImageFilmstrip
          images={images}
          selectedId={selectedImage?.id ?? null}
          onSelect={setSelectedId}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {!loading && !error && images.length === 0 && (
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-zinc-200 rounded-lg">
          <p className="text-sm text-zinc-400">
            Upload an image to start annotating
          </p>
        </div>
      )}

      {!loading && !error && selectedImage && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-zinc-500">
              {selectedImage.original_filename} &mdash; {selectedImage.width} &times;{" "}
              {selectedImage.height}px &mdash; {selectedImage.polygons.length} polygon
              {selectedImage.polygons.length !== 1 ? "s" : ""}
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
  );
}
