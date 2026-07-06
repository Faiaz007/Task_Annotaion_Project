"use client";

import { clsx } from "clsx";

interface ImageData {
  id: number;
  image: string;
  original_filename: string;
  width: number | null;
  height: number | null;
}

interface Props {
  images: ImageData[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function ImageFilmstrip({ images, selectedId, onSelect }: Props) {
  if (images.length === 0) {
    return (
      <div className="empty-state" style={{ minHeight: "88px" }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.4 }}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        No images uploaded yet
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2">
      {images.map((img, idx) => (
        <button
          key={img.id}
          id={`filmstrip-image-${img.id}`}
          onClick={() => onSelect(img.id)}
          title={img.original_filename}
          className={clsx("filmstrip-item group", selectedId === img.id && "selected")}
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          {/* Image */}
          <img
            src={img.image}
            alt={img.original_filename}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          {/* Selection overlay */}
          {selectedId === img.id && (
            <div
              className="absolute inset-0 flex items-end justify-end p-1"
              style={{ background: "linear-gradient(to top right, rgba(79,142,247,0.3), transparent)" }}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "#4f8ef7" }}
              >
                <svg width="9" height="9" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
