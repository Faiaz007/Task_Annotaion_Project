"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import api from "@/lib/api";

interface Point {
  x: number;
  y: number;
}

interface PolygonData {
  id: number;
  points: [number, number][];
  color: string;
  label: string;
}

interface ImageData {
  id: number;
  image: string;
  width: number | null;
  height: number | null;
  polygons: PolygonData[];
}

interface Props {
  image: ImageData;
  onPolygonsChanged: () => void;
}

export default function AnnotationCanvas({ image, onPolygonsChanged }: Props) {
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [selectedPolygon, setSelectedPolygon] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgNatural, setImgNatural] = useState({ w: image.width || 800, h: image.height || 600 });
  const [imgDisplay, setImgDisplay] = useState({ w: 800, h: 600 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (imgRef.current) {
      const onLoad = () => {
        const w = imgRef.current!.naturalWidth;
        const h = imgRef.current!.naturalHeight;
        setImgNatural({ w, h });
        setImgDisplay({ w: imgRef.current!.clientWidth, h: imgRef.current!.clientHeight });
      };
      imgRef.current.addEventListener("load", onLoad);
      if (imgRef.current.complete) onLoad();
    }
  }, [image.image]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setCurrentPoints((prev) => [...prev, { x, y }]);
    },
    []
  );

  const finishPolygon = useCallback(async () => {
    if (currentPoints.length < 3) return;
    setSaving(true);
    try {
      await api.post("/polygons/", {
        image: image.id,
        points: currentPoints.map((p) => [p.x, p.y]),
      });
      setCurrentPoints([]);
      onPolygonsChanged();
    } catch (err) {
      console.error("Failed to save polygon", err);
    } finally {
      setSaving(false);
    }
  }, [currentPoints, image.id, onPolygonsChanged]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      finishPolygon();
    },
    [finishPolygon]
  );

  const deletePolygon = useCallback(
    async (polygonId: number) => {
      try {
        await api.delete(`/polygons/${polygonId}/`);
        setSelectedPolygon(null);
        onPolygonsChanged();
      } catch (err) {
        console.error("Failed to delete polygon", err);
      }
    },
    [onPolygonsChanged]
  );

  const toScreen = (p: [number, number]) => ({
    x: p[0] * imgNatural.w,
    y: p[1] * imgNatural.h,
  });

  if (!image) return null;

  return (
    <div>
      <div className="relative inline-block">
        <img
          ref={imgRef}
          src={image.image}
          alt="Annotation target"
          className="max-w-full h-auto rounded border border-zinc-200"
          draggable={false}
        />
        <svg
          className="absolute inset-0 w-full h-full cursor-crosshair"
          viewBox={`0 0 ${imgNatural.w} ${imgNatural.h}`}
          onClick={handleCanvasClick}
          onDoubleClick={handleDoubleClick}
          style={{ pointerEvents: "auto" }}
        >
          {image.polygons.map((poly) => (
            <polygon
              key={poly.id}
              points={poly.points
                .map((p) => `${toScreen(p).x},${toScreen(p).y}`)
                .join(" ")}
              fill={poly.color}
              fillOpacity={selectedPolygon === poly.id ? 0.4 : 0.2}
              stroke={selectedPolygon === poly.id ? "#ef4444" : poly.color}
              strokeWidth={selectedPolygon === poly.id ? 3 : 2}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPolygon(poly.id);
              }}
              style={{ cursor: "pointer" }}
            />
          ))}
          {currentPoints.length > 0 && (
            <polygon
              points={currentPoints
                .map((p) => `${p.x * imgNatural.w},${p.y * imgNatural.h}`)
                .join(" ")}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          )}
          {currentPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x * imgNatural.w}
              cy={p.y * imgNatural.h}
              r={4}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={1.5}
            />
          ))}
        </svg>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={finishPolygon}
          disabled={currentPoints.length < 3 || saving}
          className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : `Finish Shape (${currentPoints.length} pts)`}
        </button>
        <button
          onClick={() => setCurrentPoints([])}
          disabled={currentPoints.length === 0}
          className="px-3 py-1.5 text-xs rounded-md border border-zinc-300 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        {selectedPolygon && (
          <button
            onClick={() => deletePolygon(selectedPolygon)}
            className="px-3 py-1.5 text-xs rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
          >
            Delete Selected Polygon
          </button>
        )}
        {currentPoints.length > 0 && (
          <span className="text-xs text-zinc-400">
            Click to place points, double-click to finish
          </span>
        )}
      </div>
    </div>
  );
}
