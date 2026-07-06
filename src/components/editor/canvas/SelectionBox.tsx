"use client";

import * as React from "react";
import { useEditor } from "@/lib/canvas/store";
import { CanvasElement } from "@/lib/canvas/types";

type Handle = "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r" | "rot";

interface Props {
  element: CanvasElement;
  zoom: number;
  isPrimary: boolean;
}

export function SelectionBox({ element, zoom, isPrimary }: Props) {
  const updateElement = useEditor((s) => s.updateElement);
  const pushHistory = useEditor((s) => s.pushHistory);
  const beginBatch = useEditor((s) => s.beginBatch);
  const commitBatch = useEditor((s) => s.commitBatch);
  const snapToGrid = useEditor((s) => s.snapToGrid);
  const gridSize = useEditor((s) => s.gridSize);
  const page = useEditor((s) => s.getCurrentPage());
  const selectedIds = useEditor((s) => s.selectedIds);

  const drag = React.useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    origRot: number;
    cx: number;
    cy: number;
  } | null>(null);

  const onPointerDown = (e: React.PointerEvent, handle: Handle) => {
    e.stopPropagation();
    e.preventDefault();
    if (!page) return;
    beginBatch();
    const rect = (e.currentTarget as HTMLElement)
      .closest("[data-canvas-root]")
      ?.getBoundingClientRect();
    if (!rect) return;
    const cx = element.x + element.width / 2;
    const cy = element.y + element.height / 2;
    drag.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: element.x,
      origY: element.y,
      origW: element.width,
      origH: element.height,
      origRot: element.rotation,
      cx,
      cy,
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || !page) return;
    const dx = (e.clientX - d.startX) / zoom;
    const dy = (e.clientY - d.startY) / zoom;

    if (d.handle === "rot") {
      // rotate around center of element
      const rect = document
        .querySelector(`[data-el-id="${element.id}"]`)
        ?.getBoundingClientRect();
      if (!rect) return;
      const cxScreen = rect.left + rect.width / 2;
      const cyScreen = rect.top + rect.height / 2;
      const angle =
        (Math.atan2(e.clientY - cyScreen, e.clientX - cxScreen) * 180) / Math.PI + 90;
      let snapped = angle;
      if (e.shiftKey) snapped = Math.round(angle / 15) * 15;
      updateElement(element.id, { rotation: snapped });
      return;
    }

    // un-rotate delta for handle dragging
    const rad = (d.origRot * Math.PI) / 180;
    const cos = Math.cos(-rad);
    const sin = Math.sin(-rad);
    const localDx = dx * cos - dy * sin;
    const localDy = dx * sin + dy * cos;

    let nx = d.origX;
    let ny = d.origY;
    let nw = d.origW;
    let nh = d.origH;

    if (d.handle.includes("r")) nw = Math.max(10, d.origW + localDx);
    if (d.handle.includes("l")) {
      nw = Math.max(10, d.origW - localDx);
      nx = d.origX + (d.origW - nw);
    }
    if (d.handle.includes("b")) nh = Math.max(10, d.origH + localDy);
    if (d.handle.includes("t")) {
      nh = Math.max(10, d.origH - localDy);
      ny = d.origY + (d.origH - nh);
    }

    // keep center fixed when scaling from corners by adjusting position
    // (we recompute the position to keep opposite corner fixed after rotation)
    if (d.origRot !== 0 && (d.handle === "tl" || d.handle === "tr" || d.handle === "bl" || d.handle === "br")) {
      // recompute center
      const newCx = d.cx;
      const newCy = d.cy;
      const cos2 = Math.cos(rad);
      const sin2 = Math.sin(rad);
      // local offset of new center -> top-left of new bbox
      const localOffsetX = -nw / 2;
      const localOffsetY = -nh / 2;
      // rotate back to world
      const worldDx = localOffsetX * cos2 - localOffsetY * sin2;
      const worldDy = localOffsetX * sin2 + localOffsetY * cos2;
      nx = newCx + worldDx;
      ny = newCy + worldDy;
    }

    if (snapToGrid && !e.altKey) {
      nx = Math.round(nx / gridSize) * gridSize;
      ny = Math.round(ny / gridSize) * gridSize;
    }

    // aspect ratio for shift-drag on corners
    if (e.shiftKey && (d.handle === "tl" || d.handle === "tr" || d.handle === "bl" || d.handle === "br")) {
      const ar = d.origW / d.origH;
      if (nw / nh > ar) nh = nw / ar;
      else nw = nh * ar;
    }

    updateElement(element.id, {
      x: nx,
      y: ny,
      width: nw,
      height: nh,
    });
  };

  const onUp = () => {
    drag.current = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    commitBatch();
  };

  React.useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const color = isPrimary ? "#6366f1" : "#a5b4fc";
  const handleSize = 8 / zoom;
  const strokeWidth = 1.5 / zoom;
  const rotOffset = 24 / zoom;

  const handleStyle = (h: Handle): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      width: handleSize,
      height: handleSize,
      background: "#fff",
      border: `${strokeWidth}px solid ${color}`,
      borderRadius: 2 / zoom,
    };
    const center = h === "rot";
    if (center) {
      return {
        ...base,
        left: "50%",
        top: -rotOffset - handleSize / 2,
        transform: "translateX(-50%)",
        borderRadius: "50%",
        cursor: "grab",
      };
    }
    const cursorMap: Record<string, string> = {
      tl: "nwse-resize",
      tr: "nesw-resize",
      bl: "nesw-resize",
      br: "nwse-resize",
      t: "ns-resize",
      b: "ns-resize",
      l: "ew-resize",
      r: "ew-resize",
    };
    const pos: Record<string, React.CSSProperties> = {
      tl: { left: -handleSize / 2, top: -handleSize / 2 },
      tr: { right: -handleSize / 2, top: -handleSize / 2 },
      bl: { left: -handleSize / 2, bottom: -handleSize / 2 },
      br: { right: -handleSize / 2, bottom: -handleSize / 2 },
      t: { left: "50%", top: -handleSize / 2, transform: "translateX(-50%)" },
      b: { left: "50%", bottom: -handleSize / 2, transform: "translateX(-50%)" },
      l: { top: "50%", left: -handleSize / 2, transform: "translateY(-50%)" },
      r: { top: "50%", right: -handleSize / 2, transform: "translateY(-50%)" },
    };
    return { ...base, ...pos[h], cursor: cursorMap[h] };
  };

  const showHandles = selectedIds.length <= 4;

  return (
    <div
      style={{
        position: "absolute",
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        pointerEvents: "none",
      }}
    >
      {/* outline */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `${strokeWidth}px solid ${color}`,
          pointerEvents: "none",
        }}
      />
      {/* rotation line */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: -rotOffset,
          width: 0,
          height: rotOffset,
          borderLeft: `${strokeWidth}px solid ${color}`,
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />
      {showHandles &&
        (["tl", "tr", "bl", "br", "t", "b", "l", "r", "rot"] as Handle[]).map((h) => (
          <div
            key={h}
            style={{
              ...handleStyle(h),
              pointerEvents: "auto",
            }}
            onPointerDown={(e) => onPointerDown(e, h)}
          />
        ))}
    </div>
  );
}
