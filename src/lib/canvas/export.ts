"use client";

import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import * as LucideIcons from "lucide-react";
import { toPng, toSvg, toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { Page, Project } from "./types";

export type ExportFormat = "png" | "jpg" | "svg";

export async function renderPageToDataUrl(
  page: Page,
  format: ExportFormat,
  opts?: { transparent?: boolean; scale?: number }
): Promise<string> {
  const node = buildDomClone(page);
  // Place element at top-left of viewport (0,0) — NO transform.
  // html-to-image renders the node itself, so transform on the wrapper shifts all child positions.
  // Cover overlay hides the export from the user's view.
  node.style.position = "fixed";
  node.style.left = "0";
  node.style.top = "0";
  node.style.zIndex = "2147483647"; // max int
  node.style.pointerEvents = "none";

  // Cover overlay — opaque, hides the export node from user view
  const cover = document.createElement("div");
  cover.style.position = "fixed";
  cover.style.left = "0";
  cover.style.top = "0";
  cover.style.width = "100vw";
  cover.style.height = "100vh";
  cover.style.background = "#0a0a14";
  cover.style.zIndex = "2147483646";
  cover.style.pointerEvents = "none";

  document.body.appendChild(cover);
  document.body.appendChild(node);
  try {
    // Wait for layout + fonts to settle
    await new Promise((r) => setTimeout(r, 150));
    const scale = opts?.scale || 1;
    if (format === "png") {
      return await toPng(node, {
        pixelRatio: scale,
        cacheBust: true,
        backgroundColor: opts?.transparent ? undefined : page.background.color,
        style: opts?.transparent ? { background: "transparent" } : undefined,
        width: page.width,
        height: page.height,
      });
    } else if (format === "jpg") {
      return await toJpeg(node, {
        pixelRatio: scale,
        cacheBust: true,
        quality: 0.92,
        backgroundColor: page.background.color,
        width: page.width,
        height: page.height,
      });
    } else {
      return await toSvg(node, {
        pixelRatio: scale,
        cacheBust: true,
        backgroundColor: opts?.transparent ? undefined : page.background.color,
        width: page.width,
        height: page.height,
      });
    }
  } finally {
    document.body.removeChild(node);
    document.body.removeChild(cover);
  }
}

export async function exportPage(
  page: Page,
  format: ExportFormat,
  opts?: { transparent?: boolean; scale?: number }
): Promise<Blob> {
  const dataUrl = await renderPageToDataUrl(page, format, opts);
  const blob = await (await fetch(dataUrl)).blob();
  return blob;
}

export async function exportProjectToPdf(project: Project): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: project.pages[0].width > project.pages[0].height ? "landscape" : "portrait",
    unit: "px",
    format: [project.pages[0].width, project.pages[0].height],
  });
  for (let i = 0; i < project.pages.length; i++) {
    const page = project.pages[i];
    const dataUrl = await renderPageToDataUrl(page, "jpg", { scale: 2 });
    if (i > 0) {
      pdf.addPage([page.width, page.height], page.width > page.height ? "landscape" : "portrait");
    }
    pdf.addImage(dataUrl, "JPEG", 0, 0, page.width, page.height);
  }
  return pdf.output("blob");
}

function buildDomClone(page: Page): HTMLDivElement {
  const wrap = document.createElement("div");
  // Layout dimensions set inline; position/visibility set by renderPageToDataUrl
  wrap.style.width = `${page.width}px`;
  wrap.style.height = `${page.height}px`;
  wrap.style.pointerEvents = "none";

  const root = document.createElement("div");
  root.style.position = "relative";
  root.style.width = `${page.width}px`;
  root.style.height = `${page.height}px`;
  root.style.overflow = "hidden";

  const bg = page.background;
  if (bg.type === "color") {
    root.style.background = bg.color;
  } else if (bg.type === "gradient" && bg.gradient) {
    root.style.background = `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})`;
  } else if (bg.type === "image" && bg.imageSrc) {
    root.style.backgroundImage = `url(${bg.imageSrc})`;
    root.style.backgroundSize = "cover";
    root.style.backgroundPosition = "center";
  } else if (bg.type === "pattern" && bg.pattern) {
    if (bg.pattern === "dots") {
      root.style.backgroundColor = bg.color;
      root.style.backgroundImage = `radial-gradient(${bg.patternColor || "#00000022"} 1px, transparent 1px)`;
      root.style.backgroundSize = "20px 20px";
    } else if (bg.pattern === "grid") {
      root.style.backgroundColor = bg.color;
      root.style.backgroundImage = `linear-gradient(${bg.patternColor || "#00000022"} 1px, transparent 1px), linear-gradient(90deg, ${bg.patternColor || "#00000022"} 1px, transparent 1px)`;
      root.style.backgroundSize = "20px 20px";
    } else {
      root.style.backgroundColor = bg.color;
      root.style.backgroundImage = `repeating-linear-gradient(45deg, ${bg.patternColor || "#00000022"} 0, ${bg.patternColor || "#00000022"} 1px, transparent 1px, transparent 10px)`;
    }
  }

  for (const el of page.elements) {
    if (!el.visible) continue;
    const node = buildElementDom(el);
    if (node) root.appendChild(node);
  }

  wrap.appendChild(root);
  return wrap;
}

function buildElementDom(el: any): HTMLElement | null {
  const wrap = document.createElement("div");
  wrap.style.position = "absolute";
  wrap.style.left = `${el.x}px`;
  wrap.style.top = `${el.y}px`;
  wrap.style.width = `${el.width}px`;
  wrap.style.height = `${el.height}px`;
  wrap.style.transform = `rotate(${el.rotation}deg)`;
  wrap.style.opacity = String(el.opacity);

  if (el.type === "text") {
    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.fontFamily = el.fontFamily;
    div.style.fontSize = `${el.fontSize}px`;
    div.style.fontWeight = String(el.fontWeight);
    div.style.fontStyle = el.fontStyle;
    div.style.textDecoration = el.textDecoration;
    div.style.textAlign = el.textAlign;
    div.style.color = el.color;
    div.style.lineHeight = String(el.lineHeight);
    div.style.letterSpacing = `${el.letterSpacing}px`;
    div.style.whiteSpace = "pre-wrap";
    div.style.wordBreak = "break-word";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent =
      el.textAlign === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start";
    div.style.flexDirection = "column";
    if (el.shadow) div.style.textShadow = el.shadow;
    if (el.backgroundColor) div.style.background = el.backgroundColor;
    if (el.padding) div.style.padding = `${el.padding}px`;
    div.textContent = el.text;
    wrap.appendChild(div);
  } else if (el.type === "rectangle") {
    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    if (el.gradient) {
      div.style.background = `linear-gradient(${el.gradient.angle}deg, ${el.gradient.from}, ${el.gradient.to})`;
    } else {
      div.style.background = el.fill;
    }
    if (el.strokeWidth > 0) {
      div.style.border = `${el.strokeWidth}px solid ${el.stroke}`;
    }
    if (el.radius) div.style.borderRadius = `${el.radius}px`;
    if (el.shadow) div.style.boxShadow = el.shadow;
    if (el.flipX || el.flipY) {
      div.style.transform = `scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})`;
    }
    wrap.appendChild(div);
  } else if (el.type === "ellipse") {
    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.background = el.fill;
    div.style.borderRadius = "50%";
    if (el.strokeWidth > 0) {
      div.style.border = `${el.strokeWidth}px solid ${el.stroke}`;
    }
    if (el.shadow) div.style.boxShadow = el.shadow;
    wrap.appendChild(div);
  } else if (el.type === "triangle") {
    wrap.innerHTML = `<svg width="${el.width}" height="${el.height}" viewBox="0 0 ${el.width} ${el.height}" preserveAspectRatio="none"><polygon points="${el.width / 2},0 ${el.width},${el.height} 0,${el.height}" fill="${el.fill}" ${el.strokeWidth > 0 ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ""} /></svg>`;
  } else if (el.type === "line") {
    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.background = el.fill;
    wrap.appendChild(div);
  } else if (el.type === "polygon") {
    const sides = el.sides || 6;
    const cx = el.width / 2;
    const cy = el.height / 2;
    const r = Math.min(el.width, el.height) / 2;
    const pts = Array.from({ length: sides }, (_, i) => {
      const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    wrap.innerHTML = `<svg width="${el.width}" height="${el.height}" viewBox="0 0 ${el.width} ${el.height}" preserveAspectRatio="none"><polygon points="${pts}" fill="${el.fill}" ${el.strokeWidth > 0 ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ""} /></svg>`;
  } else if (el.type === "arrow") {
    wrap.innerHTML = `<svg width="${el.width}" height="${el.height}" viewBox="0 0 ${el.width} ${el.height}" preserveAspectRatio="none"><defs><marker id="arrow-${el.id}" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L10,5 L0,10 Z" fill="${el.fill}" /></marker></defs><line x1="0" y1="${el.height / 2}" x2="${el.width - 12}" y2="${el.height / 2}" stroke="${el.fill}" stroke-width="${el.height}" marker-end="url(#arrow-${el.id})" /></svg>`;
  } else if (el.type === "image") {
    const img = document.createElement("img");
    img.src = el.src;
    img.crossOrigin = "anonymous";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = el.objectFit;
    const filterParts = [
      `brightness(${el.filter.brightness})`,
      `contrast(${el.filter.contrast})`,
      `saturate(${el.filter.saturate})`,
      `grayscale(${el.filter.grayscale})`,
      `blur(${el.filter.blur}px)`,
      `sepia(${el.filter.sepia})`,
      `hue-rotate(${el.filter.hueRotate}deg)`,
    ];
    img.style.filter = filterParts.join(" ");
    if (el.flipX || el.flipY) {
      img.style.transform = `scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})`;
    }
    wrap.style.overflow = "hidden";
    wrap.style.borderRadius = `${el.borderRadius}px`;
    wrap.appendChild(img);
  } else if (el.type === "icon") {
    const Ico = (LucideIcons as any)[el.iconKey];
    if (Ico) {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Ico, {
          size: Math.min(el.width, el.height),
          color: el.color,
          strokeWidth: el.strokeWidth,
        })
      );
      wrap.innerHTML = html;
      const svgEl = wrap.querySelector("svg");
      if (svgEl) {
        svgEl.style.width = "100%";
        svgEl.style.height = "100%";
      }
    }
  }

  return wrap;
}
