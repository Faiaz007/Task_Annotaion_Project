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

const POLY_COLORS = ["#4f8ef7", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#22d3ee"];

export default function AnnotationCanvas({ image, onPolygonsChanged }: Props) {
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [selectedPolygon, setSelectedPolygon] = useState<number | null>(null);
  const [mode, setMode] = useState<"draw" | "select">("draw");
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgNatural, setImgNatural] = useState({ w: image.width || 800, h: image.height || 600 });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const colorIndex = image.polygons.length % POLY_COLORS.length;
  const nextColor = POLY_COLORS[colorIndex];

  useEffect(() => {
    // Reset state when image changes
    setCurrentPoints([]);
    setSelectedPolygon(null);
    setMode("draw");
  }, [image.id]);

  useEffect(() => {
    if (imgRef.current) {
      const onLoad = () => {
        const w = imgRef.current!.naturalWidth;
        const h = imgRef.current!.naturalHeight;
        setImgNatural({ w, h });
      };
      imgRef.current.addEventListener("load", onLoad);
      if (imgRef.current.complete) onLoad();
    }
  }, [image.image]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (mode !== "draw") return;
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setCurrentPoints((prev) => [...prev, { x, y }]);
    },
    [mode]
  );

  const finishPolygon = useCallback(async () => {
    if (currentPoints.length < 3) return;
    setSaving(true);
    try {
      await api.post("/polygons/", {
        image: image.id,
        points: currentPoints.map((p) => [p.x, p.y]),
        color: nextColor,
      });
      setCurrentPoints([]);
      onPolygonsChanged();
    } catch (err) {
      console.error("Failed to save polygon", err);
    } finally {
      setSaving(false);
    }
  }, [currentPoints, image.id, onPolygonsChanged, nextColor]);

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
        setDeleteConfirm(null);
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
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="annotation-toolbar mb-3">
        {/* Mode toggle */}
        <div
          className="flex items-center gap-1 p-0.5 rounded-md"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)" }}
        >
          <button
            id="mode-draw"
            onClick={() => { setMode("draw"); setSelectedPolygon(null); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all"
            style={{
              background: mode === "draw" ? "rgba(79,142,247,0.2)" : "transparent",
              color: mode === "draw" ? "#4f8ef7" : "var(--text-muted)",
              border: mode === "draw" ? "1px solid rgba(79,142,247,0.3)" : "1px solid transparent",
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
            Draw
          </button>
          <button
            id="mode-select"
            onClick={() => { setMode("select"); setCurrentPoints([]); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all"
            style={{
              background: mode === "select" ? "rgba(167,139,250,0.2)" : "transparent",
              color: mode === "select" ? "#a78bfa" : "var(--text-muted)",
              border: mode === "select" ? "1px solid rgba(167,139,250,0.3)" : "1px solid transparent",
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 3l14 9-7 1-4 7-3-17z" />
            </svg>
            Select
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: "var(--border-subtle)" }} />

        {/* Actions */}
        {mode === "draw" && currentPoints.length > 0 && (
          <>
            <button
              id="finish-polygon"
              onClick={finishPolygon}
              disabled={currentPoints.length < 3 || saving}
              className="btn-primary"
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.7s linear infinite" }} />
                  Saving…
                </>
              ) : (
                <>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Finish ({currentPoints.length} pts)
                </>
              )}
            </button>
            <button
              id="cancel-polygon"
              onClick={() => setCurrentPoints([])}
              className="btn-ghost"
              style={{ padding: "6px 10px", fontSize: "12px" }}
            >
              Discard
            </button>
          </>
        )}

        {mode === "select" && selectedPolygon && (
          deleteConfirm === selectedPolygon ? (
            <>
              <span className="text-xs" style={{ color: "#f87171" }}>Confirm delete?</span>
              <button
                id="confirm-delete-polygon"
                onClick={() => deletePolygon(selectedPolygon)}
                className="btn-danger"
                style={{ padding: "5px 10px", fontSize: "12px" }}
              >
                Yes, delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-ghost"
                style={{ padding: "5px 10px", fontSize: "12px" }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              id="delete-polygon"
              onClick={() => setDeleteConfirm(selectedPolygon)}
              className="btn-danger"
              style={{ padding: "5px 10px", fontSize: "12px" }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              </svg>
              Remove polygon
            </button>
          )
        )}

        {/* Hint */}
        <div className="ml-auto">
          {mode === "draw" && currentPoints.length === 0 && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Click to place points · Double-click to finish
            </span>
          )}
          {mode === "draw" && currentPoints.length > 0 && currentPoints.length < 3 && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Need {3 - currentPoints.length} more point{3 - currentPoints.length !== 1 ? "s" : ""}
            </span>
          )}
          {mode === "select" && !selectedPolygon && image.polygons.length > 0 && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Click a polygon to select it
            </span>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative inline-block rounded-lg overflow-hidden"
        style={{
          border: "1px solid var(--border-medium)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          maxWidth: "100%",
        }}
      >
        <img
          ref={imgRef}
          src={image.image}
          alt="Annotation target"
          style={{ display: "block", maxWidth: "100%", height: "auto" }}
          draggable={false}
        />
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${imgNatural.w} ${imgNatural.h}`}
          onClick={handleCanvasClick}
          onDoubleClick={handleDoubleClick}
          style={{ cursor: mode === "draw" ? "crosshair" : "default", pointerEvents: "auto" }}
        >
          {/* Existing polygons */}
          {image.polygons.map((poly) => {
            const isSelected = selectedPolygon === poly.id;
            return (
              <g key={poly.id}>
                <polygon
                  points={poly.points
                    .map((p) => `${toScreen(p).x},${toScreen(p).y}`)
                    .join(" ")}
                  fill={poly.color}
                  fillOpacity={isSelected ? 0.45 : 0.2}
                  stroke={isSelected ? "#fff" : poly.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray={isSelected ? "none" : "none"}
                  onClick={(e) => {
                    if (mode === "select") {
                      e.stopPropagation();
                      setSelectedPolygon(isSelected ? null : poly.id);
                    }
                  }}
                  style={{ cursor: mode === "select" ? "pointer" : "default", transition: "fill-opacity 0.15s" }}
                />
                {/* Selection glow ring */}
                {isSelected && (
                  <polygon
                    points={poly.points
                      .map((p) => `${toScreen(p).x},${toScreen(p).y}`)
                      .join(" ")}
                    fill="none"
                    stroke={poly.color}
                    strokeWidth={4}
                    strokeOpacity={0.4}
                    style={{ pointerEvents: "none" }}
                  />
                )}
              </g>
            );
          })}

          {/* In-progress polygon */}
          {currentPoints.length > 0 && (
            <>
              <polygon
                points={currentPoints
                  .map((p) => `${p.x * imgNatural.w},${p.y * imgNatural.h}`)
                  .join(" ")}
                fill={nextColor}
                fillOpacity={0.1}
                stroke={nextColor}
                strokeWidth={2}
                strokeDasharray="6 3"
                style={{ pointerEvents: "none" }}
              />
              {/* Points */}
              {currentPoints.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x * imgNatural.w}
                    cy={p.y * imgNatural.h}
                    r={6}
                    fill={nextColor}
                    fillOpacity={0.2}
                    style={{ pointerEvents: "none" }}
                  />
                  <circle
                    cx={p.x * imgNatural.w}
                    cy={p.y * imgNatural.h}
                    r={3.5}
                    fill={nextColor}
                    stroke="white"
                    strokeWidth={1.5}
                    style={{ pointerEvents: "none" }}
                  />
                  {i === 0 && (
                    <circle
                      cx={p.x * imgNatural.w}
                      cy={p.y * imgNatural.h}
                      r={8}
                      fill="none"
                      stroke={nextColor}
                      strokeWidth={1.5}
                      strokeDasharray="3 2"
                      opacity={0.6}
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                </g>
              ))}
            </>
          )}
        </svg>
      </div>

      {/* Polygon list */}
      {image.polygons.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
            Annotations ({image.polygons.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {image.polygons.map((poly, i) => (
              <button
                key={poly.id}
                onClick={() => {
                  setMode("select");
                  setSelectedPolygon(poly.id === selectedPolygon ? null : poly.id);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: selectedPolygon === poly.id ? `${poly.color}20` : "rgba(255,255,255,0.04)",
                  border: selectedPolygon === poly.id ? `1px solid ${poly.color}50` : "1px solid var(--border-subtle)",
                  color: selectedPolygon === poly.id ? poly.color : "var(--text-secondary)",
                }}
              >
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: poly.color }} />
                Polygon {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
