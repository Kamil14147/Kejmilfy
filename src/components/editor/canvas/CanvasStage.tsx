"use client";

import * as React from "react";
import { useEditor } from "@/lib/canvas/store";
import { ElementRenderer } from "./ElementRenderer";
import { SelectionBox } from "./SelectionBox";
import { LiveCursors } from "@/components/editor/LiveCursors";
import { CanvasElement, defaultBackground } from "@/lib/canvas/types";

interface CanvasStageProps {
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}

export function CanvasStage({ editingId, setEditingId }: CanvasStageProps) {
  const project = useEditor((s) => s.project);
  const currentPageId = useEditor((s) => s.currentPageId);
  const page = useEditor((s) => s.getCurrentPage());
  const zoom = useEditor((s) => s.zoom);
  const pan = useEditor((s) => s.pan);
  const setZoom = useEditor((s) => s.setZoom);
  const setPan = useEditor((s) => s.setPan);
  const zoomIn = useEditor((s) => s.zoomIn);
  const zoomOut = useEditor((s) => s.zoomOut);
  const zoomToFit = useEditor((s) => s.zoomToFit);
  const showGrid = useEditor((s) => s.showGrid);
  const showRulers = useEditor((s) => s.showRulers);
  const snapToGrid = useEditor((s) => s.snapToGrid);
  const gridSize = useEditor((s) => s.gridSize);

  // Block native drag-and-drop globally inside the editor (prevents black ghost bars on images)
  React.useEffect(() => {
    const preventDrag = (e: Event) => e.preventDefault();
    window.addEventListener("dragstart", preventDrag);
    return () => window.removeEventListener("dragstart", preventDrag);
  }, []);
  const selectedIds = useEditor((s) => s.selectedIds);
  const select = useEditor((s) => s.select);
  const selectMany = useEditor((s) => s.selectMany);
  const clearSelection = useEditor((s) => s.clearSelection);
  const updateElement = useEditor((s) => s.updateElement);
  const pushHistory = useEditor((s) => s.pushHistory);
  const beginBatch = useEditor((s) => s.beginBatch);
  const commitBatch = useEditor((s) => s.commitBatch);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const pageSurfaceRef = React.useRef<HTMLDivElement>(null);

  // marquee selection
  const marquee = React.useRef<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [marqueeRect, setMarqueeRect] = React.useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // dragging element
  const drag = React.useRef<{
    ids: string[];
    startX: number;
    startY: number;
    orig: Map<string, { x: number; y: number }>;
  } | null>(null);

  const onBackgroundPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.bg === "1") {
      // start marquee
      const rect = rootRef.current!.getBoundingClientRect();
      marquee.current = {
        x0: e.clientX,
        y0: e.clientY,
        x1: e.clientX,
        y1: e.clientY,
      };
      setMarqueeRect({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        w: 0,
        h: 0,
      });
      clearSelection();
      window.addEventListener("pointermove", onMarqueeMove);
      window.addEventListener("pointerup", onMarqueeUp);
    }
  };

  const onMarqueeMove = (e: PointerEvent) => {
    if (!marquee.current || !rootRef.current) return;
    marquee.current.x1 = e.clientX;
    marquee.current.y1 = e.clientY;
    const rect = rootRef.current.getBoundingClientRect();
    const x = Math.min(marquee.current.x0, marquee.current.x1) - rect.left;
    const y = Math.min(marquee.current.y0, marquee.current.y1) - rect.top;
    const w = Math.abs(marquee.current.x1 - marquee.current.x0);
    const h = Math.abs(marquee.current.y1 - marquee.current.y0);
    setMarqueeRect({ x, y, w, h });
  };

  const onMarqueeUp = () => {
    if (marquee.current && page) {
      const rect = rootRef.current!.getBoundingClientRect();
      const x0 = (Math.min(marquee.current.x0, marquee.current.x1) - rect.left - pan.x) / zoom;
      const y0 = (Math.min(marquee.current.y0, marquee.current.y1) - rect.top - pan.y) / zoom;
      const x1 = (Math.max(marquee.current.x0, marquee.current.x1) - rect.left - pan.x) / zoom;
      const y1 = (Math.max(marquee.current.y0, marquee.current.y1) - rect.top - pan.y) / zoom;
      const hits = page.elements.filter((el) => {
        if (!el.visible) return false;
        return el.x < x1 && el.x + el.width > x0 && el.y < y1 && el.y + el.height > y0;
      });
      if (hits.length > 0) selectMany(hits.map((h) => h.id), e_shiftKey());
    }
    marquee.current = null;
    setMarqueeRect(null);
    window.removeEventListener("pointermove", onMarqueeMove);
    window.removeEventListener("pointerup", onMarqueeUp);
  };

  // hack: detect if shift is held during marquee up
  const shiftHeld = React.useRef(false);
  React.useEffect(() => {
    const dn = (e: KeyboardEvent) => (shiftHeld.current = e.shiftKey);
    const up = (e: KeyboardEvent) => (shiftHeld.current = e.shiftKey);
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
    };
  }, []);
  function e_shiftKey() {
    return shiftHeld.current;
  }

  const onElementPointerDown = (e: React.PointerEvent, el: CanvasElement) => {
    if (el.locked) return;
    if (editingId === el.id) return;
    e.stopPropagation();
    e.preventDefault(); // Prevent native drag ghost (black bars on images)
    const additive = e.shiftKey;
    if (additive) {
      select(el.id, true);
    } else if (!selectedIds.includes(el.id)) {
      select(el.id, false);
    }
    // begin drag
    const ids = additive ? Array.from(new Set([...selectedIds, el.id])) : [el.id];
    const orig = new Map<string, { x: number; y: number }>();
    const curPage = useEditor.getState().getCurrentPage();
    if (!curPage) return;
    for (const id of ids) {
      const e2 = curPage.elements.find((x) => x.id === id);
      if (e2) orig.set(id, { x: e2.x, y: e2.y });
    }
    drag.current = { ids, startX: e.clientX, startY: e.clientY, orig };
    beginBatch();
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragUp);
  };

  const onDragMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || !page) return;
    const dx = (e.clientX - d.startX) / zoom;
    const dy = (e.clientY - d.startY) / zoom;
    for (const id of d.ids) {
      const o = d.orig.get(id);
      if (!o) continue;
      let nx = o.x + dx;
      let ny = o.y + dy;
      if (snapToGrid && !e.altKey) {
        nx = Math.round(nx / gridSize) * gridSize;
        ny = Math.round(ny / gridSize) * gridSize;
      }
      updateElement(id, { x: nx, y: ny });
    }
  };

  const onDragUp = () => {
    drag.current = null;
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragUp);
    commitBatch();
  };

  React.useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onDragMove);
      window.removeEventListener("pointerup", onDragUp);
      window.removeEventListener("pointermove", onMarqueeMove);
      window.removeEventListener("pointerup", onMarqueeUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, zoom, pan, snapToGrid, gridSize]);

  // wheel zoom with ctrl/cmd
  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.005;
      const newZoom = Math.max(0.05, Math.min(8, zoom * (1 + delta)));
      setZoom(newZoom);
    } else {
      setPan({ x: pan.x - e.deltaX, y: pan.y - e.deltaY });
    }
  };

  // pan with space-drag
  const [isPanning, setIsPanning] = React.useState(false);
  const spaceDown = React.useRef(false);
  const panStart = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  React.useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTextInput(e.target)) {
        spaceDown.current = true;
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceDown.current = false;
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const onPanDown = (e: React.PointerEvent) => {
    if (!spaceDown.current && e.button !== 1) return;
    e.preventDefault();
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    window.addEventListener("pointermove", onPanMove);
    window.addEventListener("pointerup", onPanUp);
  };
  const onPanMove = (e: PointerEvent) => {
    if (!panStart.current) return;
    setPan({
      x: panStart.current.px + (e.clientX - panStart.current.x),
      y: panStart.current.py + (e.clientY - panStart.current.y),
    });
  };
  const onPanUp = () => {
    setIsPanning(false);
    panStart.current = null;
    window.removeEventListener("pointermove", onPanMove);
    window.removeEventListener("pointerup", onPanUp);
  };

  if (!project || !page) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Brak projektu
      </div>
    );
  }

  const bg = page.background || defaultBackground();
  let bgStyle: React.CSSProperties = { background: bg.color };
  if (bg.type === "gradient" && bg.gradient) {
    bgStyle = { background: `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})` };
  } else if (bg.type === "image" && bg.imageSrc) {
    bgStyle = {
      backgroundImage: `url(${bg.imageSrc})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  } else if (bg.type === "pattern" && bg.pattern) {
    if (bg.pattern === "dots") {
      bgStyle = {
        backgroundColor: bg.color,
        backgroundImage: `radial-gradient(${bg.patternColor || "#00000022"} 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      };
    } else if (bg.pattern === "grid") {
      bgStyle = {
        backgroundColor: bg.color,
        backgroundImage: `linear-gradient(${bg.patternColor || "#00000022"} 1px, transparent 1px), linear-gradient(90deg, ${bg.patternColor || "#00000022"} 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      };
    } else {
      bgStyle = {
        backgroundColor: bg.color,
        backgroundImage: `repeating-linear-gradient(45deg, ${bg.patternColor || "#00000022"} 0, ${bg.patternColor || "#00000022"} 1px, transparent 1px, transparent 10px)`,
      };
    }
  }

  return (
    <div
      ref={rootRef}
      data-canvas-root
      className="relative flex-1 overflow-hidden bg-muted/30"
      onWheel={onWheel}
      onPointerDown={onPanDown}
      style={{ cursor: isPanning ? "grabbing" : spaceDown.current ? "grab" : "default" }}
    >
      {/* canvas surface */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        {/* page */}
        <div
          ref={pageSurfaceRef}
          data-bg="1"
          data-page-surface="1"
          onPointerDown={onBackgroundPointerDown}
          className="relative shadow-2xl"
          style={{
            width: page.width,
            height: page.height,
            ...bgStyle,
            cursor: "default",
          }}
        >
          {/* grid overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(#0001 1px, transparent 1px), linear-gradient(90deg, #0001 1px, transparent 1px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
            />
          )}
          {/* elements */}
          {page.elements.map((el) =>
            !el.visible ? null : (
              <div
                key={el.id}
                data-el-id={el.id}
                onPointerDown={(e) => onElementPointerDown(e, el)}
                onDoubleClick={(e) => {
                  if (el.type === "text") {
                    e.stopPropagation();
                    select(el.id, false);
                    setEditingId(el.id);
                  }
                }}
                style={{ cursor: el.locked ? "default" : "move" }}
              >
                <ElementRenderer
                  element={el}
                  editing={editingId === el.id}
                  zoom={zoom}
                  onTextChange={(text) => {
                    updateElement(el.id, { text } as Partial<CanvasElement>);
                    pushHistory();
                    setEditingId(null);
                  }}
                />
              </div>
            )
          )}

          {/* selection boxes */}
          {selectedIds.map((id) => {
            const el = page.elements.find((x) => x.id === id);
            if (!el || !el.visible) return null;
            return (
              <SelectionBox
                key={id}
                element={el}
                zoom={zoom}
                isPrimary={selectedIds.length === 1 || id === selectedIds[selectedIds.length - 1]}
              />
            );
          })}

          {/* marquee */}
          {marqueeRect && (
            <div
              className="absolute pointer-events-none border border-primary bg-primary/10"
              style={{
                left: (marqueeRect.x - pan.x) / zoom - page.width / 2 + (rootRef.current?.clientWidth || 0) / 2 / zoom,
                top: (marqueeRect.y - pan.y) / zoom - page.height / 2 + (rootRef.current?.clientHeight || 0) / 2 / zoom,
                width: marqueeRect.w / zoom,
                height: marqueeRect.h / zoom,
              }}
            />
          )}

          {/* Live cursors (Supabase Realtime) */}
          {project && (
            <LiveCursors
              projectId={project.id}
              canvasPageRef={pageSurfaceRef as React.RefObject<HTMLElement>}
              zoom={zoom}
            />
          )}
        </div>
      </div>

      {/* rulers */}
      {showRulers && <Rulers pageWidth={page.width} pageHeight={page.height} zoom={zoom} pan={pan} />}

      {/* zoom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/95 backdrop-blur border rounded-full shadow-lg px-2 py-1 z-20">
        <button onClick={zoomOut} className="p-1.5 hover:bg-muted rounded-full" title="Zoom out">
          <span className="text-xs">−</span>
        </button>
        <span className="text-xs w-12 text-center select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={zoomIn} className="p-1.5 hover:bg-muted rounded-full" title="Zoom in">
          <span className="text-xs">+</span>
        </button>
        <button onClick={zoomToFit} className="px-2 py-1 hover:bg-muted rounded-full text-xs ml-1" title="Fit">
          Fit
        </button>
      </div>
    </div>
  );
}

function Rulers({
  pageWidth,
  pageHeight,
  zoom,
  pan,
}: {
  pageWidth: number;
  pageHeight: number;
  zoom: number;
  pan: { x: number; y: number };
}) {
  return (
    <>
      <div className="absolute top-0 left-7 right-0 h-7 bg-background/95 border-b overflow-hidden pointer-events-none z-30">
        <div
          className="absolute"
          style={{
            left: `calc(50% + ${pan.x}px - ${(pageWidth * zoom) / 2}px)`,
            width: pageWidth * zoom,
            height: 28,
          }}
        >
          <svg width="100%" height="28" className="overflow-visible">
            {Array.from({ length: Math.ceil(pageWidth / 50) + 1 }, (_, i) => (
              <g key={i} transform={`translate(${i * 50 * zoom}, 0)`}>
                <line x1={0} y1={20} x2={0} y2={28} stroke="#94a3b8" strokeWidth={1} />
                <text x={2} y={14} fontSize={9} fill="#64748b">
                  {i * 50}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <div className="absolute top-7 left-0 bottom-0 w-7 bg-background/95 border-r overflow-hidden pointer-events-none z-30">
        <div
          className="absolute"
          style={{
            top: `calc(50% + ${pan.y}px - ${(pageHeight * zoom) / 2}px)`,
            height: pageHeight * zoom,
            width: 28,
          }}
        >
          <svg width="28" height="100%" className="overflow-visible">
            {Array.from({ length: Math.ceil(pageHeight / 50) + 1 }, (_, i) => (
              <g key={i} transform={`translate(0, ${i * 50 * zoom})`}>
                <line x1={20} y1={0} x2={28} y2={0} stroke="#94a3b8" strokeWidth={1} />
                <text x={2} y={-2} fontSize={9} fill="#64748b" transform="rotate(-90 6 0)">
                  {i * 50}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-7 h-7 bg-background border-b border-r z-40" />
    </>
  );
}

function isTextInput(t: EventTarget | null) {
  if (!t) return false;
  const tag = (t as HTMLElement).tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || (t as HTMLElement).isContentEditable;
}
