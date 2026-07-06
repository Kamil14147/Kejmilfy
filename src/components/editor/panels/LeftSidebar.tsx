"use client";

import * as React from "react";
import {
  Type,
  Square,
  Circle,
  Triangle,
  Minus,
  Hexagon,
  ArrowRight,
  Image as ImageIcon,
  Star,
  Upload,
  LayoutTemplate,
  Sparkles,
  Palette,
  Search,
  Shapes,
} from "lucide-react";
import { useEditor } from "@/lib/canvas/store";
import {
  defaultTextElement,
  defaultShapeElement,
  defaultIconElement,
  defaultImageElement,
  PROJECT_SIZES,
  ShapeElement,
} from "@/lib/canvas/types";
import { TEMPLATES, ICONS } from "@/lib/canvas/assets";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

const SHAPES = [
  { type: "rectangle", icon: Square, label: "Prostokąt" },
  { type: "ellipse", icon: Circle, label: "Koło" },
  { type: "triangle", icon: Triangle, label: "Trójkąt" },
  { type: "line", icon: Minus, label: "Linia" },
  { type: "polygon", icon: Hexagon, label: "Wielokąt" },
  { type: "arrow", icon: ArrowRight, label: "Strzałka" },
] as const;

const FONTS = [
  "Inter",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Helvetica",
  "Verdana",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
  "Brush Script MT",
  "Lucida Console",
];

const TEXT_PRESETS = [
  { label: "Dodaj nagłówek", size: 48, weight: 700, sample: "Dodaj nagłówek" },
  { label: "Dodaj podtytuł", size: 28, weight: 600, sample: "Dodaj podtytuł" },
  { label: "Dodaj tekst", size: 18, weight: 400, sample: "Dodaj trochę tekstu" },
];

export function LeftSidebar() {
  const [tab, setTab] = React.useState("templates");

  return (
    <div className="w-72 border-r bg-background flex flex-col h-full overflow-hidden">
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full overflow-hidden">
        <TabsList className="grid grid-cols-6 rounded-none border-b bg-transparent h-auto p-0 flex-shrink-0">
          <TabsTrigger value="templates" className="flex-col py-2 gap-0.5 data-[state=active]:bg-transparent">
            <LayoutTemplate className="h-4 w-4" />
            <span className="text-[10px]">Szablony</span>
          </TabsTrigger>
          <TabsTrigger value="elements" className="flex-col py-2 gap-0.5 data-[state=active]:bg-transparent">
            <Shapes className="h-4 w-4" />
            <span className="text-[10px]">Elementy</span>
          </TabsTrigger>
          <TabsTrigger value="text" className="flex-col py-2 gap-0.5 data-[state=active]:bg-transparent">
            <Type className="h-4 w-4" />
            <span className="text-[10px]">Tekst</span>
          </TabsTrigger>
          <TabsTrigger value="uploads" className="flex-col py-2 gap-0.5 data-[state=active]:bg-transparent">
            <Upload className="h-4 w-4" />
            <span className="text-[10px]">Pliki</span>
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex-col py-2 gap-0.5 data-[state=active]:bg-transparent">
            <ImageIcon className="h-4 w-4" />
            <span className="text-[10px]">Zdjęcia</span>
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex-col py-2 gap-0.5 data-[state=active]:bg-transparent">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px]">Marka</span>
          </TabsTrigger>
        </TabsList>

        {/* Use plain overflow-y-auto — ScrollArea has known issues with flex heights */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <TabsContent value="templates" className="m-0 p-3 mt-0">
            <TemplatesPanel />
          </TabsContent>
          <TabsContent value="elements" className="m-0 p-3 mt-0">
            <ElementsPanel />
          </TabsContent>
          <TabsContent value="text" className="m-0 p-3 mt-0">
            <TextPanel />
          </TabsContent>
          <TabsContent value="uploads" className="m-0 p-3 mt-0">
            <UploadsPanel />
          </TabsContent>
          <TabsContent value="photos" className="m-0 p-3 mt-0">
            <PhotosPanel />
          </TabsContent>
          <TabsContent value="brand" className="m-0 p-3 mt-0">
            <BrandKitPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function TemplatesPanel() {
  const addElements = useEditor((s) => s.addElements);
  const page = useEditor((s) => s.getCurrentPage());
  const [query, setQuery] = React.useState("");

  if (!page) return null;

  const filtered = TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj szablonów..."
          className="pl-8 h-9"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => {
              const els = tpl.elements(page.width, page.height);
              addElements(els);
              toast.success(`Dodano: ${tpl.name}`);
            }}
            className="group relative aspect-[3/4] rounded-lg overflow-hidden border hover:border-primary transition-colors bg-card"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  tpl.preview?.background ||
                  "linear-gradient(135deg, #e0e7ff, #f0f9ff)",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
              <div className="text-[10px] font-medium line-clamp-2">{tpl.name}</div>
              <div className="text-[9px] text-muted-foreground">{tpl.category}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ElementsPanel() {
  const addElement = useEditor((s) => s.addElement);
  const page = useEditor((s) => s.getCurrentPage());
  if (!page) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Kształty</h3>
        <div className="grid grid-cols-3 gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.type}
              onClick={() => addElement(defaultShapeElement(s.type as ShapeElement["type"], page.width, page.height))}
              className="aspect-square rounded-lg border hover:border-primary hover:bg-accent transition-colors flex flex-col items-center justify-center gap-1"
            >
              <s.icon className="h-5 w-5" />
              <span className="text-[9px] text-muted-foreground">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <IconPicker />

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Tła</h3>
        <BackgroundPresets />
      </div>

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Ramki</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Prostokąt", type: "rectangle", radius: 0 },
            { label: "Zaokrąglone", type: "rectangle", radius: 24 },
            { label: "Koło", type: "ellipse", radius: 0 },
          ].map((f) => (
            <button
              key={f.label}
              onClick={() => {
                const shape = defaultShapeElement(f.type as any, page.width, page.height);
                shape.fill = "transparent";
                shape.stroke = "#94a3b8";
                shape.strokeWidth = 4;
                if (f.radius) shape.radius = f.radius;
                addElement(shape);
              }}
              className="aspect-square rounded-lg border hover:border-primary flex items-center justify-center"
            >
              <div
                className="w-12 h-12 border-4 border-muted-foreground"
                style={{ borderRadius: f.radius || (f.type === "ellipse" ? "50%" : 0) }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function IconPicker() {
  const addElement = useEditor((s) => s.addElement);
  const page = useEditor((s) => s.getCurrentPage());
  const [query, setQuery] = React.useState("");
  if (!page) return null;
  const filtered = ICONS.filter((ic) => ic.toLowerCase().includes(query.toLowerCase())).slice(0, 60);
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Ikony</h3>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Szukaj ikon..."
        className="h-9 mb-2"
      />
      <div className="grid grid-cols-4 gap-1 max-h-64 overflow-y-auto">
        {filtered.map((ic) => {
          const Ico = (LucideIcons as any)[ic];
          if (!Ico) return null;
          return (
            <button
              key={ic}
              onClick={() => {
                const el = defaultIconElement(page.width, page.height);
                el.iconKey = ic;
                addElement(el);
              }}
              className="aspect-square rounded border hover:border-primary hover:bg-accent flex items-center justify-center"
              title={ic}
            >
              <Ico className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BackgroundPresets() {
  const setBackground = useEditor((s) => s.setBackground);
  const presets = [
    { type: "color", color: "#ffffff" },
    { type: "color", color: "#0f172a" },
    { type: "color", color: "#fef3c7" },
    { type: "color", color: "#fce7f3" },
    { type: "color", color: "#dbeafe" },
    { type: "color", color: "#dcfce7" },
    { type: "gradient", gradient: { from: "#f59e0b", to: "#ef4444", angle: 135 } },
    { type: "gradient", gradient: { from: "#3b82f6", to: "#8b5cf6", angle: 135 } },
    { type: "gradient", gradient: { from: "#10b981", to: "#06b6d4", angle: 135 } },
    { type: "gradient", gradient: { from: "#ec4899", to: "#8b5cf6", angle: 135 } },
    { type: "gradient", gradient: { from: "#000", to: "#4338ca", angle: 135 } },
    { type: "gradient", gradient: { from: "#fbbf24", to: "#f97316", angle: 135 } },
    { type: "pattern", color: "#fafafa", pattern: "dots", patternColor: "#cbd5e1" },
    { type: "pattern", color: "#fafafa", pattern: "grid", patternColor: "#cbd5e1" },
    { type: "pattern", color: "#fafafa", pattern: "lines", patternColor: "#cbd5e1" },
  ] as const;
  return (
    <div className="grid grid-cols-5 gap-2">
      {presets.map((bg, i) => (
        <button
          key={i}
          onClick={() => setBackground(bg as any)}
          className="aspect-square rounded-lg border hover:border-primary overflow-hidden"
          style={
            bg.type === "color"
              ? { background: bg.color }
              : bg.type === "gradient"
                ? { background: `linear-gradient(${bg.gradient!.angle}deg, ${bg.gradient!.from}, ${bg.gradient!.to})` }
                : { background: bg.color }
          }
        />
      ))}
    </div>
  );
}

function TextPanel() {
  const addElement = useEditor((s) => s.addElement);
  const page = useEditor((s) => s.getCurrentPage());
  if (!page) return null;

  return (
    <div className="space-y-3">
      <Button
        className="w-full"
        onClick={() => addElement(defaultTextElement(page.width, page.height))}
      >
        <Type className="h-4 w-4 mr-2" /> Dodaj pole tekstowe
      </Button>
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Style domyślne</h3>
        {TEXT_PRESETS.map((p) => {
          const el = defaultTextElement(page.width, page.height);
          el.text = p.sample;
          el.fontSize = p.size;
          el.fontWeight = p.weight;
          return (
            <button
              key={p.label}
              onClick={() => addElement(el)}
              className="w-full p-3 rounded-lg border hover:border-primary text-left transition-colors"
              style={{ fontFamily: "Inter" }}
            >
              <div
                style={{
                  fontSize: Math.min(p.size / 2, 22),
                  fontWeight: p.weight,
                  color: "#0f172a",
                  lineHeight: 1.2,
                }}
              >
                {p.sample}
              </div>
            </button>
          );
        })}
      </div>
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Kombinacje fontów</h3>
        <div className="space-y-2">
          {[
            { head: "Georgia", body: "Arial" },
            { head: "Impact", body: "Verdana" },
            { head: "Trebuchet MS", body: "Georgia" },
          ].map((combo, i) => (
            <button
              key={i}
              onClick={() => {
                const h = defaultTextElement(page.width, page.height);
                h.text = "Wielki nagłówek";
                h.fontFamily = combo.head;
                h.fontSize = 56;
                h.fontWeight = 800;
                h.y = page.height / 2 - 80;
                const b = defaultTextElement(page.width, page.height);
                b.text = "Podtytuł treści";
                b.fontFamily = combo.body;
                b.fontSize = 22;
                b.fontWeight = 400;
                b.y = page.height / 2 + 20;
                useEditor.getState().addElements([h, b]);
              }}
              className="w-full p-3 rounded-lg border hover:border-primary text-left"
            >
              <div style={{ fontFamily: combo.head, fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>
                Wielki nagłówek
              </div>
              <div style={{ fontFamily: combo.body, fontSize: 13, color: "#475569" }}>
                Podtytuł treści
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function UploadsPanel() {
  const addElement = useEditor((s) => s.addElement);
  const page = useEditor((s) => s.getCurrentPage());
  const [uploads, setUploads] = React.useState<string[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);

  if (!page) return null;

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        // get dimensions
        const img = new Image();
        img.onload = () => {
          const el = defaultImageElement(src, img.naturalWidth, img.naturalHeight, page.width, page.height);
          addElement(el);
        };
        img.src = src;
        setUploads((u) => [src, ...u]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
      >
        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Przeciągnij pliki lub kliknij</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      {uploads.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {uploads.map((src, i) => (
            <button
              key={i}
              onClick={() => {
                const img = new Image();
                img.onload = () => {
                  const el = defaultImageElement(src, img.naturalWidth, img.naturalHeight, page.width, page.height);
                  addElement(el);
                };
                img.src = src;
              }}
              className="aspect-square rounded-lg overflow-hidden border hover:border-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="upload" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotosPanel() {
  const addElement = useEditor((s) => s.addElement);
  const page = useEditor((s) => s.getCurrentPage());
  const [query, setQuery] = React.useState("");

  if (!page) return null;

  // Use Picsum photos for free stock images
  const photos = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    url: `https://picsum.photos/seed/${query || "canva"}${i}/400/400`,
    thumb: `https://picsum.photos/seed/${query || "canva"}${i}/200/200`,
  }));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj zdjęć..."
          className="pl-8 h-9"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              const img = new Image();
              img.onload = () => {
                const el = defaultImageElement(p.url, img.naturalWidth, img.naturalHeight, page.width, page.height);
                addElement(el);
              };
              img.src = p.url;
            }}
            className="aspect-square rounded-lg overflow-hidden border hover:border-primary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumb} alt="stock" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Zdjęcia z Picsum Photos (darmowe)
      </p>
    </div>
  );
}

function BrandKitPanel() {
  const project = useEditor((s) => s.project);
  const addElement = useEditor((s) => s.addElement);
  const page = useEditor((s) => s.getCurrentPage());
  const [colors, setColors] = React.useState<string[]>(project?.brandKit?.colors || []);
  const [fonts, setFonts] = React.useState<string[]>(project?.brandKit?.fonts || []);
  const [colorInput, setColorInput] = React.useState("#6366f1");
  const [fontInput, setFontInput] = React.useState(FONTS[0]);

  if (!page) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
          <Palette className="h-3 w-3" /> Kolory marki
        </h3>
        <div className="flex gap-2 mb-2">
          <Input
            type="color"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            className="h-9 w-12 p-1"
          />
          <Button
            size="sm"
            onClick={() => {
              const next = [...colors, colorInput];
              setColors(next);
              useEditor.setState((s) => ({
                project: s.project ? { ...s.project, brandKit: { ...s.project.brandKit!, colors: next } } : s.project,
              }));
            }}
          >
            Dodaj
          </Button>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {colors.map((c, i) => (
            <button
              key={i}
              onClick={() => {
                // apply to selected
                const sel = useEditor.getState().selectedIds;
                if (sel.length > 0) {
                  const el = useEditor.getState().getElement(sel[0]);
                  if (el) {
                    if (el.type === "text") {
                      useEditor.getState().updateElement(el.id, { color: c } as any);
                    } else if ("fill" in el) {
                      useEditor.getState().updateElement(el.id, { fill: c } as any);
                    }
                    useEditor.getState().pushHistory();
                  }
                } else {
                  setBackgroundToPage(c);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                const next = colors.filter((_, j) => j !== i);
                setColors(next);
                useEditor.setState((s) => ({
                  project: s.project ? { ...s.project, brandKit: { ...s.project.brandKit!, colors: next } } : s.project,
                }));
              }}
              className="aspect-square rounded border"
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Fonty marki</h3>
        <select
          value={fontInput}
          onChange={(e) => setFontInput(e.target.value)}
          className="w-full h-9 rounded-md border bg-background px-2 text-sm mb-2"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => {
            const next = [...fonts, fontInput];
            setFonts(next);
            useEditor.setState((s) => ({
              project: s.project ? { ...s.project, brandKit: { ...s.project.brandKit!, fonts: next } } : s.project,
            }));
          }}
        >
          Dodaj font do marki
        </Button>
        <div className="space-y-1 mt-2">
          {fonts.map((f, i) => (
            <button
              key={i}
              onClick={() => {
                const el = defaultTextElement(page.width, page.height);
                el.fontFamily = f;
                addElement(el);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                const next = fonts.filter((_, j) => j !== i);
                setFonts(next);
                useEditor.setState((s) => ({
                  project: s.project ? { ...s.project, brandKit: { ...s.project.brandKit!, fonts: next } } : s.project,
                }));
              }}
              className="w-full p-2 rounded border hover:border-primary text-left text-sm"
              style={{ fontFamily: f }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function setBackgroundToPage(color: string) {
  useEditor.getState().setBackground({ type: "color", color });
}
