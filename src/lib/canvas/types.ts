// ============= Element types =============
export type ElementType =
  | "text"
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "line"
  | "polygon"
  | "arrow"
  | "image"
  | "icon"
  | "frame"
  | "video"
  | "audio"
  | "group";

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  name?: string;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline" | "line-through";
  textAlign: "left" | "center" | "right" | "justify";
  color: string;
  lineHeight: number;
  letterSpacing: number;
  shadow?: string;
  stroke?: string;
  strokeWidth?: number;
  curve?: number;
  backgroundColor?: string;
  padding?: number;
}

export interface ShapeElement extends BaseElement {
  type: "rectangle" | "ellipse" | "triangle" | "line" | "polygon" | "arrow";
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius?: number;
  sides?: number;
  shadow?: string;
  flipX?: boolean;
  flipY?: boolean;
  gradient?: { from: string; to: string; angle: number };
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt?: string;
  borderRadius: number;
  filter: ImageFilter;
  flipX?: boolean;
  flipY?: boolean;
  objectFit: "cover" | "contain" | "fill";
  frame?: string;
}

export interface IconElement extends BaseElement {
  type: "icon";
  iconKey: string;
  color: string;
  strokeWidth: number;
}

export interface GroupElement extends BaseElement {
  type: "group";
  childIds: string[];
}

export type CanvasElement =
  | TextElement
  | ShapeElement
  | ImageElement
  | IconElement
  | GroupElement;

export interface ImageFilter {
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  blur: number;
  sepia: number;
  hueRotate: number;
}

export const defaultFilter: ImageFilter = {
  brightness: 1,
  contrast: 1,
  saturate: 1,
  grayscale: 0,
  blur: 0,
  sepia: 0,
  hueRotate: 0,
};

export function filterToCss(f: ImageFilter): string {
  return [
    `brightness(${f.brightness})`,
    `contrast(${f.contrast})`,
    `saturate(${f.saturate})`,
    `grayscale(${f.grayscale})`,
    `blur(${f.blur}px)`,
    `sepia(${f.sepia})`,
    `hue-rotate(${f.hueRotate}deg)`,
  ].join(" ");
}

export type BackgroundType = "color" | "gradient" | "image" | "pattern";

export interface Background {
  type: BackgroundType;
  color: string;
  gradient?: { from: string; to: string; angle: number };
  imageSrc?: string;
  pattern?: "dots" | "grid" | "lines";
  patternColor?: string;
}

export interface Page {
  id: string;
  name: string;
  width: number;
  height: number;
  background: Background;
  elements: CanvasElement[];
  duration?: number;
  transition?: "none" | "fade" | "slide" | "zoom";
}

export interface ProjectSize {
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
}

export interface Project {
  id: string;
  name: string;
  pages: Page[];
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  favorite?: boolean;
  deleted?: boolean;
  folderId?: string | null;
  brandKit?: BrandKit;
}

export interface BrandKit {
  colors: string[];
  fonts: string[];
  logo?: string;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

export const PROJECT_SIZES: ProjectSize[] = [
  { id: "ig-post", name: "Instagram Post", width: 1080, height: 1080, category: "Social Media" },
  { id: "ig-story", name: "Instagram Story", width: 1080, height: 1920, category: "Social Media" },
  { id: "fb-post", name: "Facebook Post", width: 1200, height: 1200, category: "Social Media" },
  { id: "x-post", name: "X / Twitter Post", width: 1600, height: 900, category: "Social Media" },
  { id: "linkedin", name: "LinkedIn Post", width: 1200, height: 627, category: "Social Media" },
  { id: "pin", name: "Pinterest Pin", width: 1000, height: 1500, category: "Social Media" },
  { id: "yt-thumb", name: "YouTube Thumbnail", width: 1280, height: 720, category: "Social Media" },
  { id: "pres-16-9", name: "Presentation 16:9", width: 1920, height: 1080, category: "Presentation" },
  { id: "pres-4-3", name: "Presentation 4:3", width: 1024, height: 768, category: "Presentation" },
  { id: "doc-a4", name: "Document A4", width: 794, height: 1123, category: "Document" },
  { id: "doc-letter", name: "Letter", width: 816, height: 1056, category: "Document" },
  { id: "poster-a3", name: "Poster A3", width: 1123, height: 1587, category: "Print" },
  { id: "poster-a2", name: "Poster A2", width: 1587, height: 2245, category: "Print" },
  { id: "card", name: "Business Card", width: 1050, height: 600, category: "Print" },
  { id: "logo", name: "Logo", width: 800, height: 800, category: "Other" },
];

export function getCategorySizes(cat: string) {
  return PROJECT_SIZES.filter((s) => s.category === cat);
}

export function getCategories() {
  return Array.from(new Set(PROJECT_SIZES.map((s) => s.category)));
}

export function defaultBackground(): Background {
  return { type: "color", color: "#ffffff" };
}

export function newPage(width: number, height: number, name?: string): Page {
  return {
    id: `p_${Math.random().toString(36).slice(2, 10)}`,
    name: name || "Page",
    width,
    height,
    background: defaultBackground(),
    elements: [],
    transition: "none",
  };
}

export function newProject(size: ProjectSize, name = "Untitled design"): Project {
  const now = Date.now();
  return {
    id: `prj_${Math.random().toString(36).slice(2, 12)}`,
    name,
    pages: [newPage(size.width, size.height, "Page 1")],
    createdAt: now,
    updatedAt: now,
    brandKit: { colors: [], fonts: [] },
  };
}

export function makeId(prefix = "el") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function defaultTextElement(width: number, height: number): TextElement {
  return {
    id: makeId("txt"),
    type: "text",
    x: width / 2 - 200,
    y: height / 2 - 30,
    width: 400,
    height: 60,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    text: "Dodaj nagłówek",
    fontFamily: "Inter",
    fontSize: 48,
    fontWeight: 700,
    fontStyle: "normal",
    textDecoration: "none",
    textAlign: "center",
    color: "#0f172a",
    lineHeight: 1.2,
    letterSpacing: 0,
    padding: 0,
  };
}

export function defaultShapeElement(
  type: ShapeElement["type"],
  width: number,
  height: number
): ShapeElement {
  const base = {
    id: makeId("shp"),
    x: width / 2 - 100,
    y: height / 2 - 100,
    width: 200,
    height: 200,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    fill: "#6366f1",
    stroke: "transparent",
    strokeWidth: 0,
  };
  if (type === "rectangle") return { ...base, type, radius: 0 };
  if (type === "ellipse") return { ...base, type };
  if (type === "triangle") return { ...base, type };
  if (type === "line")
    return {
      ...base,
      type,
      height: 4,
      fill: "#0f172a",
      y: height / 2,
    };
  if (type === "polygon") return { ...base, type, sides: 6, fill: "#22c55e" };
  if (type === "arrow") return { ...base, type, width: 240, height: 12, fill: "#ef4444" };
  return { ...base, type: "rectangle" };
}

export function defaultIconElement(width: number, height: number): IconElement {
  return {
    id: makeId("ico"),
    type: "icon",
    x: width / 2 - 50,
    y: height / 2 - 50,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    iconKey: "Star",
    color: "#f59e0b",
    strokeWidth: 2,
  };
}

export function defaultImageElement(
  src: string,
  w: number,
  h: number,
  width: number,
  height: number
): ImageElement {
  const aspect = w / h || 1;
  const newW = Math.min(400, width * 0.5);
  const newH = newW / aspect;
  return {
    id: makeId("img"),
    type: "image",
    x: width / 2 - newW / 2,
    y: height / 2 - newH / 2,
    width: newW,
    height: newH,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    src,
    borderRadius: 0,
    filter: { ...defaultFilter },
    objectFit: "cover",
  };
}
