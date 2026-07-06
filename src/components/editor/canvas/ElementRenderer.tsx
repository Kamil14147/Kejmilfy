"use client";

import * as React from "react";
import * as Icons from "lucide-react";
import {
  CanvasElement,
  TextElement,
  ShapeElement,
  ImageElement,
  IconElement,
  filterToCss,
} from "@/lib/canvas/types";
import { cn } from "@/lib/utils";

interface ElementRendererProps {
  element: CanvasElement;
  editing?: boolean;
  onTextChange?: (text: string) => void;
  zoom?: number;
}

export function ElementRenderer({ element, editing, onTextChange, zoom = 1 }: ElementRendererProps) {
  const commonStyle: React.CSSProperties = {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation}deg)`,
    opacity: element.opacity,
    pointerEvents: element.locked ? "none" : "auto",
    cursor: editing ? "text" : "inherit",
  };

  switch (element.type) {
    case "text":
      return <TextRender el={element} style={commonStyle} editing={editing} onTextChange={onTextChange} />;
    case "rectangle":
    case "ellipse":
    case "triangle":
    case "line":
    case "polygon":
    case "arrow":
      return <ShapeRender el={element} style={commonStyle} />;
    case "image":
      return <ImageRender el={element} style={commonStyle} />;
    case "icon":
      return <IconRender el={element} style={commonStyle} />;
    case "group":
      return null; // group is a virtual container; children are rendered separately
    default:
      return null;
  }
}

function TextRender({
  el,
  style,
  editing,
  onTextChange,
}: {
  el: TextElement;
  style: React.CSSProperties;
  editing?: boolean;
  onTextChange?: (t: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      // select all
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  const textShadow = el.shadow
    ? el.shadow
    : el.stroke
      ? `${el.stroke} 0 0 1px, ${el.stroke} 0 0 1px, ${el.stroke} 0 0 1px, ${el.stroke} 0 0 1px, ${el.stroke} 0 0 1px, ${el.stroke} 0 0 1px`
      : undefined;

  return (
    <div
      ref={ref}
      style={{
        ...style,
        fontFamily: el.fontFamily,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        fontStyle: el.fontStyle,
        textDecoration: el.textDecoration,
        textAlign: el.textAlign,
        color: el.color,
        lineHeight: el.lineHeight,
        letterSpacing: el.letterSpacing,
        textShadow,
        backgroundColor: el.backgroundColor,
        padding: el.padding,
        WebkitBackgroundClip: el.stroke ? "text" : undefined,
        WebkitTextFillColor: el.stroke ? "transparent" : undefined,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflow: "hidden",
        outline: "none",
        display: "flex",
        alignItems: "center",
        justifyContent:
          el.textAlign === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start",
        flexDirection: "column",
        userSelect: editing ? "text" : "none",
      }}
      contentEditable={editing}
      suppressContentEditableWarning
      onBlur={(e) => {
        if (editing && onTextChange) onTextChange(e.currentTarget.innerText);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && editing && onTextChange) {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }}
    >
      {editing ? el.text : el.text.split("\n").map((line, i) => (
        <div key={i} style={{ width: "100%" }}>{line || "\u00a0"}</div>
      ))}
    </div>
  );
}

function ShapeRender({ el, style }: { el: ShapeElement; style: React.CSSProperties }) {
  const fill = el.gradient
    ? `linear-gradient(${el.gradient.angle}deg, ${el.gradient.from}, ${el.gradient.to})`
    : el.fill;
  const flip = `scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})`;
  const transform = `${style.transform} ${flip}`;

  if (el.type === "rectangle") {
    return (
      <div
        style={{
          ...style,
          transform,
          background: fill,
          border: el.strokeWidth > 0 ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
          borderRadius: el.radius,
          boxShadow: el.shadow,
        }}
      />
    );
  }

  if (el.type === "ellipse") {
    return (
      <div
        style={{
          ...style,
          transform,
          background: fill,
          borderRadius: "50%",
          border: el.strokeWidth > 0 ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
          boxShadow: el.shadow,
        }}
      />
    );
  }

  if (el.type === "triangle") {
    return (
      <svg
        style={{ ...style, transform, overflow: "visible" }}
        width={el.width}
        height={el.height}
        viewBox={`0 0 ${el.width} ${el.height}`}
        preserveAspectRatio="none"
      >
        <polygon
          points={`${el.width / 2},0 ${el.width},${el.height} 0,${el.height}`}
          fill={fill}
          stroke={el.strokeWidth > 0 ? el.stroke : "none"}
          strokeWidth={el.strokeWidth}
        />
      </svg>
    );
  }

  if (el.type === "line") {
    return (
      <div
        style={{
          ...style,
          transform,
          background: fill,
          boxShadow: el.shadow,
        }}
      />
    );
  }

  if (el.type === "polygon") {
    const sides = el.sides || 6;
    const cx = el.width / 2;
    const cy = el.height / 2;
    const r = Math.min(el.width, el.height) / 2;
    const pts = Array.from({ length: sides }, (_, i) => {
      const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return (
      <svg
        style={{ ...style, transform, overflow: "visible" }}
        width={el.width}
        height={el.height}
        viewBox={`0 0 ${el.width} ${el.height}`}
        preserveAspectRatio="none"
      >
        <polygon
          points={pts}
          fill={fill}
          stroke={el.strokeWidth > 0 ? el.stroke : "none"}
          strokeWidth={el.strokeWidth}
        />
      </svg>
    );
  }

  if (el.type === "arrow") {
    return (
      <svg
        style={{ ...style, transform, overflow: "visible" }}
        width={el.width}
        height={el.height}
        viewBox={`0 0 ${el.width} ${el.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <marker
            id={`arrow-${el.id}`}
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill={el.fill} />
          </marker>
        </defs>
        <line
          x1="0"
          y1={el.height / 2}
          x2={el.width - 12}
          y2={el.height / 2}
          stroke={el.fill}
          strokeWidth={el.height}
          markerEnd={`url(#arrow-${el.id})`}
        />
      </svg>
    );
  }

  return null;
}

function ImageRender({ el, style }: { el: ImageElement; style: React.CSSProperties }) {
  const flip = `scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})`;
  return (
    <div
      style={{
        ...style,
        overflow: "hidden",
        borderRadius: el.borderRadius,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={el.src}
        alt={el.alt || ""}
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: el.objectFit,
          filter: filterToCss(el.filter),
          transform: flip,
          userSelect: "none",
          display: "block",
        }}
      />
    </div>
  );
}

function IconRender({ el, style }: { el: IconElement; style: React.CSSProperties }) {
  const IconCmp = (Icons as any)[el.iconKey] as React.ComponentType<any> | undefined;
  if (!IconCmp) return null;
  const size = Math.min(el.width, el.height);
  const flip = `scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})`;
  return (
    <div
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `${style.transform} ${flip}`,
      }}
    >
      <IconCmp size={size} color={el.color} strokeWidth={el.strokeWidth} />
    </div>
  );
}
