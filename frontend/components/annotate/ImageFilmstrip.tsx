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

export default function ImageFilmstrip({
  images,
  selectedId,
  onSelect,
}: Props) {
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 border-2 border-dashed border-zinc-200 rounded-lg">
        <p className="text-xs text-zinc-400">No images uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {images.map((img) => (
        <button
          key={img.id}
          onClick={() => onSelect(img.id)}
          className={clsx(
            "shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all",
            selectedId === img.id
              ? "border-zinc-800 ring-1 ring-zinc-800"
              : "border-zinc-200 hover:border-zinc-400"
          )}
        >
          <img
            src={img.image}
            alt={img.original_filename}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
