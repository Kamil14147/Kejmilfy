"use client";

import * as React from "react";
import { CanvasElement } from "@/lib/canvas/types";

export interface SnapLine {
  axis: "x" | "y";
  pos: number; // px in canvas coordinates
  start: number;
  end: number;
}

// Find snap suggestions for a moving element
export function findSnapLines(
  moving: CanvasElement,
  others: CanvasElement[],
  threshold = 6
): { lines: SnapLine[]; dx: number; dy: number } {
  const lines: SnapLine[] = [];
  let dx = 0;
  let dy = 0;

  const m = {
    left: moving.x,
    right: moving.x + moving.width,
    cx: moving.x + moving.width / 2,
    top: moving.y,
    bottom: moving.y + moving.height,
    cy: moving.y + moving.height / 2,
  };

  let bestX = threshold + 1;
  let bestY = threshold + 1;

  for (const o of others) {
    if (o.id === moving.id || !o.visible) continue;
    const t = {
      left: o.x,
      right: o.x + o.width,
      cx: o.x + o.width / 2,
      top: o.y,
      bottom: o.y + o.height,
      cy: o.y + o.height / 2,
    };
    // check x alignment: moving left vs others left/center/right
    const xPairs: Array<[number, number]> = [
      [m.left, t.left], [m.left, t.cx], [m.left, t.right],
      [m.cx, t.left], [m.cx, t.cx], [m.cx, t.right],
      [m.right, t.left], [m.right, t.cx], [m.right, t.right],
    ];
    for (const [a, b] of xPairs) {
      const d = b - a;
      if (Math.abs(d) < Math.abs(bestX)) {
        bestX = Math.abs(d);
        dx = d;
      }
    }
    // check y alignment
    const yPairs: Array<[number, number]> = [
      [m.top, t.top], [m.top, t.cy], [m.top, t.bottom],
      [m.cy, t.top], [m.cy, t.cy], [m.cy, t.bottom],
      [m.bottom, t.top], [m.bottom, t.cy], [m.bottom, t.bottom],
    ];
    for (const [a, b] of yPairs) {
      const d = b - a;
      if (Math.abs(d) < Math.abs(bestY)) {
        bestY = Math.abs(d);
        dy = d;
      }
    }
  }

  // If a snap was found, generate visible lines spanning the matching elements
  if (Math.abs(dx) <= threshold) {
    // find which other elements match
    const snapped = moving.x + dx;
    const targets = others.filter((o) => {
      if (o.id === moving.id || !o.visible) return false;
      return (
        Math.abs(o.x - snapped) < threshold ||
        Math.abs(o.x + o.width - snapped) < threshold ||
        Math.abs(o.x + o.width / 2 - snapped) < threshold
      );
    });
    if (targets.length) {
      const minY = Math.min(moving.y, ...targets.map((t) => t.y));
      const maxY = Math.max(moving.y + moving.height, ...targets.map((t) => t.y + t.height));
      lines.push({ axis: "x", pos: snapped, start: minY, end: maxY });
    }
  }
  if (Math.abs(dy) <= threshold) {
    const snapped = moving.y + dy;
    const targets = others.filter((o) => {
      if (o.id === moving.id || !o.visible) return false;
      return (
        Math.abs(o.y - snapped) < threshold ||
        Math.abs(o.y + o.height - snapped) < threshold ||
        Math.abs(o.y + o.height / 2 - snapped) < threshold
      );
    });
    if (targets.length) {
      const minX = Math.min(moving.x, ...targets.map((t) => t.x));
      const maxX = Math.max(moving.x + moving.width, ...targets.map((t) => t.x + t.width));
      lines.push({ axis: "y", pos: snapped, start: minX, end: maxX });
    }
  }

  return { lines, dx, dy };
}
