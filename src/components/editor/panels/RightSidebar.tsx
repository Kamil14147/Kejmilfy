"use client";

import * as React from "react";
import { useEditor } from "@/lib/canvas/store";
import {
  CanvasElement,
  TextElement,
  ShapeElement,
  ImageElement,
  IconElement,
  defaultFilter,
} from "@/lib/canvas/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  FlipHorizontal,
  FlipVertical,
  BringToFront,
  SendToBack,
  ArrowUp,
  ArrowDown,
  Group,
  Ungroup,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const FONTS = [
  "Inter", "Arial", "Georgia", "Times New Roman", "Courier New",
  "Helvetica", "Verdana", "Trebuchet MS", "Impact", "Comic Sans MS",
  "Brush Script MT", "Lucida Console",
];

export function RightSidebar() {
  const selectedIds = useEditor((s) => s.selectedIds);
  const page = useEditor((s) => s.getCurrentPage());
  const tabs = useEditor((s) => s);
  const [tab, setTab] = React.useState<"props" | "layers">("props");

  React.useEffect(() => {
    if (selectedIds.length > 0) setTab("props");
  }, [selectedIds]);

  return (
    <div className="w-72 border-l bg-background flex flex-col h-full overflow-hidden">
      <div className="flex border-b flex-shrink-0">
        <button
          onClick={() => setTab("props")}
          className={cn(
            "flex-1 py-2 text-xs font-medium transition-colors",
            tab === "props" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Właściwości
        </button>
        <button
          onClick={() => setTab("layers")}
          className={cn(
            "flex-1 py-2 text-xs font-medium transition-colors",
            tab === "layers" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Warstwy
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === "props" ? (
          <PropertiesPanel />
        ) : (
          <LayersPanel />
        )}
      </div>
    </div>
  );
}

function PropertiesPanel() {
  const selectedIds = useEditor((s) => s.selectedIds);
  const page = useEditor((s) => s.getCurrentPage());
  const updateElement = useEditor((s) => s.updateElement);
  const deleteElements = useEditor((s) => s.deleteElements);
  const duplicateElements = useEditor((s) => s.duplicateElements);
  const toggleLock = useEditor((s) => s.toggleLock);
  const toggleVisibility = useEditor((s) => s.toggleVisibility);
  const flipElement = useEditor((s) => s.flipElement);
  const bringForward = useEditor((s) => s.bringForward);
  const sendBackward = useEditor((s) => s.sendBackward);
  const bringToFront = useEditor((s) => s.bringToFront);
  const sendToBack = useEditor((s) => s.sendToBack);
  const groupElements = useEditor((s) => s.groupElements);
  const ungroupElements = useEditor((s) => s.ungroupElements);
  const alignElements = useEditor((s) => s.alignElements);
  const distributeElements = useEditor((s) => s.distributeElements);
  const pushHistory = useEditor((s) => s.pushHistory);

  if (!page) return null;

  if (selectedIds.length === 0) {
    return <PagePropertiesPanel />;
  }

  if (selectedIds.length > 1) {
    return (
      <div className="p-3 space-y-4">
        <div className="text-xs text-muted-foreground">
          Zaznaczono {selectedIds.length} elementów
        </div>
        <div>
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Wyrównanie</h4>
          <div className="grid grid-cols-6 gap-1">
            <IconBtn title="Wyrównaj do lewej" onClick={() => alignElements(selectedIds, "left")}>
              <AlignStartVertical className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Wyśrodkuj poziomo" onClick={() => alignElements(selectedIds, "center")}>
              <AlignCenterVertical className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Wyrównaj do prawej" onClick={() => alignElements(selectedIds, "right")}>
              <AlignEndVertical className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Wyrównaj do góry" onClick={() => alignElements(selectedIds, "top")}>
              <AlignStartHorizontal className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Wyśrodkuj pionowo" onClick={() => alignElements(selectedIds, "middle")}>
              <AlignCenterHorizontal className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Wyrównaj do dołu" onClick={() => alignElements(selectedIds, "bottom")}>
              <AlignEndHorizontal className="h-4 w-4" />
            </IconBtn>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Rozłóż równomiernie</h4>
          <div className="grid grid-cols-2 gap-1">
            <Button variant="outline" size="sm" onClick={() => distributeElements(selectedIds, "horizontal")}>
              Poziomo
            </Button>
            <Button variant="outline" size="sm" onClick={() => distributeElements(selectedIds, "vertical")}>
              Pionowo
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => groupElements(selectedIds)}
        >
          <Group className="h-4 w-4 mr-2" /> Grupuj
        </Button>
      </div>
    );
  }

  const el = page.elements.find((e) => e.id === selectedIds[0]);
  if (!el) return null;

  const commit = () => pushHistory();

  return (
    <div className="p-3 space-y-4">
      {/* Quick actions */}
      <div className="grid grid-cols-6 gap-1">
        <IconBtn title="Duplikuj" onClick={() => duplicateElements([el.id])}>
          <Copy className="h-4 w-4" />
        </IconBtn>
        <IconBtn title="Usuń" onClick={() => deleteElements([el.id])}>
          <Trash2 className="h-4 w-4" />
        </IconBtn>
        <IconBtn title={el.locked ? "Odblokuj" : "Zablokuj"} onClick={() => toggleLock(el.id)}>
          {el.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </IconBtn>
        <IconBtn title={el.visible ? "Ukryj" : "Pokaż"} onClick={() => toggleVisibility(el.id)}>
          {el.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </IconBtn>
        <IconBtn title="Przesuń w górę" onClick={() => bringForward(el.id)}>
          <ArrowUp className="h-4 w-4" />
        </IconBtn>
        <IconBtn title="Przesuń w dół" onClick={() => sendBackward(el.id)}>
          <ArrowDown className="h-4 w-4" />
        </IconBtn>
      </div>

      {/* Transform */}
      <Section title="Pozycja i rozmiar">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">X</Label>
            <Input
              type="number"
              value={Math.round(el.x)}
              onChange={(e) => updateElement(el.id, { x: +e.target.value })}
              onBlur={commit}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Y</Label>
            <Input
              type="number"
              value={Math.round(el.y)}
              onChange={(e) => updateElement(el.id, { y: +e.target.value })}
              onBlur={commit}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Szer.</Label>
            <Input
              type="number"
              value={Math.round(el.width)}
              onChange={(e) => updateElement(el.id, { width: Math.max(1, +e.target.value) })}
              onBlur={commit}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Wys.</Label>
            <Input
              type="number"
              value={Math.round(el.height)}
              onChange={(e) => updateElement(el.id, { height: Math.max(1, +e.target.value) })}
              onBlur={commit}
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div className="mt-2">
          <Label className="text-[10px] text-muted-foreground">Obrót: {Math.round(el.rotation)}°</Label>
          <Slider
            value={[el.rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={(v) => updateElement(el.id, { rotation: v[0] })}
            onValueCommit={commit}
            className="mt-1"
          />
        </div>
        <div className="mt-2">
          <Label className="text-[10px] text-muted-foreground">Krycie: {Math.round(el.opacity * 100)}%</Label>
          <Slider
            value={[el.opacity * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => updateElement(el.id, { opacity: v[0] / 100 })}
            onValueCommit={commit}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-1 mt-2">
          <Button variant="outline" size="sm" onClick={() => flipElement(el.id, "x")}>
            <FlipHorizontal className="h-4 w-4 mr-1" /> Odbicie X
          </Button>
          <Button variant="outline" size="sm" onClick={() => flipElement(el.id, "y")}>
            <FlipVertical className="h-4 w-4 mr-1" /> Odbicie Y
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-1 mt-2">
          <IconBtn title="Na wierzch" onClick={() => bringToFront(el.id)}>
            <BringToFront className="h-4 w-4" />
          </IconBtn>
          <IconBtn title="Na spód" onClick={() => sendToBack(el.id)}>
            <SendToBack className="h-4 w-4" />
          </IconBtn>
          <IconBtn title="W górę" onClick={() => bringForward(el.id)}>
            <ArrowUp className="h-4 w-4" />
          </IconBtn>
          <IconBtn title="W dół" onClick={() => sendBackward(el.id)}>
            <ArrowDown className="h-4 w-4" />
          </IconBtn>
        </div>
      </Section>

      {/* Type-specific */}
      {el.type === "text" && <TextProps el={el as TextElement} commit={commit} />}
      {(el.type === "rectangle" ||
        el.type === "ellipse" ||
        el.type === "triangle" ||
        el.type === "line" ||
        el.type === "polygon" ||
        el.type === "arrow") && <ShapeProps el={el as ShapeElement} commit={commit} />}
      {el.type === "image" && <ImageProps el={el as ImageElement} commit={commit} />}
      {el.type === "icon" && <IconProps el={el as IconElement} commit={commit} />}
      {el.type === "group" && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => ungroupElements(el.id)}
        >
          <Ungroup className="h-4 w-4 mr-2" /> Rozgrupuj
        </Button>
      )}
    </div>
  );
}

function PagePropertiesPanel() {
  const page = useEditor((s) => s.getCurrentPage());
  const setBackground = useEditor((s) => s.setBackground);
  const setPageSize = useEditor((s) => s.setPageSize);
  const magicResize = useEditor((s) => s.magicResize);
  const [color, setColor] = React.useState(page?.background.color || "#ffffff");
  const [w, setW] = React.useState(page?.width || 1080);
  const [h, setH] = React.useState(page?.height || 1080);

  React.useEffect(() => {
    if (page) {
      setColor(page.background.color);
      setW(page.width);
      setH(page.height);
    }
  }, [page?.id, page?.width, page?.height]);

  if (!page) return null;

  return (
    <div className="p-3 space-y-4">
      <Section title="Strona">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Szerokość</Label>
            <Input
              type="number"
              value={w}
              onChange={(e) => setW(+e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Wysokość</Label>
            <Input
              type="number"
              value={h}
              onChange={(e) => setH(+e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => setPageSize(w, h)}
        >
          Zmień rozmiar strony
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-1"
          onClick={() => magicResize(w, h)}
        >
          ✨ Magic Resize (skaluj zawartość)
        </Button>
      </Section>

      <Section title="Tło">
        <div className="space-y-2">
          <Label className="text-[10px] text-muted-foreground">Kolor</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setBackground({ type: "color", color: e.target.value });
              }}
              className="h-9 w-12 p-1"
            />
            <Input
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setBackground({ type: "color", color: e.target.value });
              }}
              className="h-9 text-xs"
            />
          </div>
          <Label className="text-[10px] text-muted-foreground mt-2">Gradient</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="color"
              defaultValue="#f59e0b"
              id="grad-from"
              className="h-9 p-1"
            />
            <Input
              type="color"
              defaultValue="#ef4444"
              id="grad-to"
              className="h-9 p-1"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const from = (document.getElementById("grad-from") as HTMLInputElement).value;
              const to = (document.getElementById("grad-to") as HTMLInputElement).value;
              setBackground({ type: "gradient", color: from, gradient: { from, to, angle: 135 } });
            }}
          >
            Zastosuj gradient
          </Button>
        </div>
      </Section>
    </div>
  );
}

function TextProps({ el, commit }: { el: TextElement; commit: () => void }) {
  const updateElement = useEditor((s) => s.updateElement);
  return (
    <>
      <Section title="Czcionka">
        <Select
          value={el.fontFamily}
          onValueChange={(v) => {
            updateElement(el.id, { fontFamily: v } as Partial<CanvasElement>);
            commit();
          }}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((f) => (
              <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Rozmiar</Label>
            <Input
              type="number"
              value={el.fontSize}
              onChange={(e) => updateElement(el.id, { fontSize: +e.target.value } as Partial<CanvasElement>)}
              onBlur={commit}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Waga</Label>
            <Select
              value={String(el.fontWeight)}
              onValueChange={(v) => {
                updateElement(el.id, { fontWeight: +v } as Partial<CanvasElement>);
                commit();
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[100, 300, 400, 500, 600, 700, 800, 900].map((w) => (
                  <SelectItem key={w} value={String(w)}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Interlinia</Label>
            <Input
              type="number"
              step="0.05"
              value={el.lineHeight}
              onChange={(e) => updateElement(el.id, { lineHeight: +e.target.value } as Partial<CanvasElement>)}
              onBlur={commit}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Odstępy</Label>
            <Input
              type="number"
              value={el.letterSpacing}
              onChange={(e) => updateElement(el.id, { letterSpacing: +e.target.value } as Partial<CanvasElement>)}
              onBlur={commit}
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          <IconBtn
            active={el.fontWeight >= 700}
            onClick={() => {
              updateElement(el.id, { fontWeight: el.fontWeight >= 700 ? 400 : 700 } as Partial<CanvasElement>);
              commit();
            }}
          >
            <Bold className="h-4 w-4" />
          </IconBtn>
          <IconBtn
            active={el.fontStyle === "italic"}
            onClick={() => {
              updateElement(el.id, { fontStyle: el.fontStyle === "italic" ? "normal" : "italic" } as Partial<CanvasElement>);
              commit();
            }}
          >
            <Italic className="h-4 w-4" />
          </IconBtn>
          <IconBtn
            active={el.textDecoration === "underline"}
            onClick={() => {
              updateElement(el.id, { textDecoration: el.textDecoration === "underline" ? "none" : "underline" } as Partial<CanvasElement>);
              commit();
            }}
          >
            <Underline className="h-4 w-4" />
          </IconBtn>
        </div>
        <ToggleGroup
          type="single"
          value={el.textAlign}
          onValueChange={(v) => {
            if (v) {
              updateElement(el.id, { textAlign: v as any } as Partial<CanvasElement>);
              commit();
            }
          }}
          className="mt-2 grid grid-cols-4 gap-1"
        >
          <ToggleGroupItem value="left" className="h-8"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="center" className="h-8"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="right" className="h-8"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="justify" className="h-8"><AlignJustify className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
      </Section>
      <Section title="Kolor i efekty">
        <Label className="text-[10px] text-muted-foreground">Kolor tekstu</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="color"
            value={el.color}
            onChange={(e) => updateElement(el.id, { color: e.target.value } as Partial<CanvasElement>)}
            onBlur={commit}
            className="h-9 w-12 p-1"
          />
          <Input
            value={el.color}
            onChange={(e) => updateElement(el.id, { color: e.target.value } as Partial<CanvasElement>)}
            onBlur={commit}
            className="h-9 text-xs"
          />
        </div>
        <Label className="text-[10px] text-muted-foreground mt-2">Cień</Label>
        <Input
          value={el.shadow || ""}
          placeholder="np. 2px 2px 4px #00000080"
          onChange={(e) => updateElement(el.id, { shadow: e.target.value } as Partial<CanvasElement>)}
          onBlur={commit}
          className="h-8 text-xs mt-1"
        />
        <Label className="text-[10px] text-muted-foreground mt-2">Kontur (kolor)</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="color"
            value={el.stroke || "#000000"}
            onChange={(e) => updateElement(el.id, { stroke: e.target.value } as Partial<CanvasElement>)}
            className="h-9 w-12 p-1"
          />
          <Input
            type="number"
            value={el.strokeWidth || 0}
            onChange={(e) => updateElement(el.id, { strokeWidth: +e.target.value } as Partial<CanvasElement>)}
            onBlur={commit}
            className="h-9 text-xs"
            placeholder="grubość"
          />
        </div>
      </Section>
    </>
  );
}

function ShapeProps({ el, commit }: { el: ShapeElement; commit: () => void }) {
  const updateElement = useEditor((s) => s.updateElement);
  return (
    <Section title="Wypełnienie i obramowanie">
      <Label className="text-[10px] text-muted-foreground">Wypełnienie</Label>
      <div className="flex gap-2 mt-1">
        <Input
          type="color"
          value={el.fill.startsWith("#") ? el.fill : "#6366f1"}
          onChange={(e) => updateElement(el.id, { fill: e.target.value, gradient: undefined } as Partial<CanvasElement>)}
          onBlur={commit}
          className="h-9 w-12 p-1"
        />
        <Input
          value={el.fill}
          onChange={(e) => updateElement(el.id, { fill: e.target.value, gradient: undefined } as Partial<CanvasElement>)}
          onBlur={commit}
          className="h-9 text-xs"
        />
      </div>
      {el.type === "rectangle" && (
        <div className="mt-2">
          <Label className="text-[10px] text-muted-foreground">Zaokrąglenie rogów: {el.radius || 0}px</Label>
          <Slider
            value={[el.radius || 0]}
            min={0}
            max={200}
            step={1}
            onValueChange={(v) => updateElement(el.id, { radius: v[0] } as Partial<CanvasElement>)}
            onValueCommit={commit}
            className="mt-1"
          />
        </div>
      )}
      {el.type === "polygon" && (
        <div className="mt-2">
          <Label className="text-[10px] text-muted-foreground">Liczba boków: {el.sides || 6}</Label>
          <Slider
            value={[el.sides || 6]}
            min={3}
            max={12}
            step={1}
            onValueChange={(v) => updateElement(el.id, { sides: v[0] } as Partial<CanvasElement>)}
            onValueCommit={commit}
            className="mt-1"
          />
        </div>
      )}
      <Label className="text-[10px] text-muted-foreground mt-2">Obramowanie</Label>
      <div className="flex gap-2 mt-1">
        <Input
          type="color"
          value={el.stroke.startsWith("#") ? el.stroke : "#000000"}
          onChange={(e) => updateElement(el.id, { stroke: e.target.value } as Partial<CanvasElement>)}
          className="h-9 w-12 p-1"
        />
        <Input
          type="number"
          value={el.strokeWidth}
          onChange={(e) => updateElement(el.id, { strokeWidth: +e.target.value } as Partial<CanvasElement>)}
          onBlur={commit}
          className="h-9 text-xs"
          placeholder="grubość"
        />
      </div>
      <Label className="text-[10px] text-muted-foreground mt-2">Cień</Label>
      <Input
        value={el.shadow || ""}
        placeholder="np. 0 4px 12px #00000033"
        onChange={(e) => updateElement(el.id, { shadow: e.target.value } as Partial<CanvasElement>)}
        onBlur={commit}
        className="h-8 text-xs mt-1"
      />
    </Section>
  );
}

function ImageProps({ el, commit }: { el: ImageElement; commit: () => void }) {
  const updateElement = useEditor((s) => s.updateElement);
  const f = el.filter;
  return (
    <Section title="Obraz">
      <Label className="text-[10px] text-muted-foreground">Zaokrąglenie rogów: {el.borderRadius}px</Label>
      <Slider
        value={[el.borderRadius]}
        min={0}
        max={500}
        step={1}
        onValueChange={(v) => updateElement(el.id, { borderRadius: v[0] } as Partial<CanvasElement>)}
        onValueCommit={commit}
        className="mt-1"
      />
      <Label className="text-[10px] text-muted-foreground mt-2">Dopasowanie</Label>
      <Select
        value={el.objectFit}
        onValueChange={(v) => {
          updateElement(el.id, { objectFit: v as any } as Partial<CanvasElement>);
          commit();
        }}
      >
        <SelectTrigger className="h-8 text-xs mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cover">Wypełnij</SelectItem>
          <SelectItem value="contain">Dopasuj</SelectItem>
          <SelectItem value="fill">Rozciągnij</SelectItem>
        </SelectContent>
      </Select>
      <Label className="text-[10px] text-muted-foreground mt-3">Filtry</Label>
      <div className="space-y-2 mt-1">
        <SliderRow label="Jasność" value={f.brightness} min={0} max={2} step={0.05} onChange={(v) => updateElement(el.id, { filter: { ...f, brightness: v } } as Partial<CanvasElement>)} onCommit={commit} />
        <SliderRow label="Kontrast" value={f.contrast} min={0} max={2} step={0.05} onChange={(v) => updateElement(el.id, { filter: { ...f, contrast: v } } as Partial<CanvasElement>)} onCommit={commit} />
        <SliderRow label="Nasycenie" value={f.saturate} min={0} max={2} step={0.05} onChange={(v) => updateElement(el.id, { filter: { ...f, saturate: v } } as Partial<CanvasElement>)} onCommit={commit} />
        <SliderRow label="Szarość" value={f.grayscale} min={0} max={1} step={0.05} onChange={(v) => updateElement(el.id, { filter: { ...f, grayscale: v } } as Partial<CanvasElement>)} onCommit={commit} />
        <SliderRow label="Sepia" value={f.sepia} min={0} max={1} step={0.05} onChange={(v) => updateElement(el.id, { filter: { ...f, sepia: v } } as Partial<CanvasElement>)} onCommit={commit} />
        <SliderRow label="Rozmycie" value={f.blur} min={0} max={20} step={0.5} onChange={(v) => updateElement(el.id, { filter: { ...f, blur: v } } as Partial<CanvasElement>)} onCommit={commit} />
        <SliderRow label="Odcień" value={f.hueRotate} min={0} max={360} step={5} onChange={(v) => updateElement(el.id, { filter: { ...f, hueRotate: v } } as Partial<CanvasElement>)} onCommit={commit} />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2"
        onClick={() => {
          updateElement(el.id, { filter: { ...defaultFilter } } as Partial<CanvasElement>);
          commit();
        }}
      >
        Resetuj filtry
      </Button>
    </Section>
  );
}

function IconProps({ el, commit }: { el: IconElement; commit: () => void }) {
  const updateElement = useEditor((s) => s.updateElement);
  return (
    <Section title="Ikona">
      <Label className="text-[10px] text-muted-foreground">Kolor</Label>
      <div className="flex gap-2 mt-1">
        <Input
          type="color"
          value={el.color}
          onChange={(e) => updateElement(el.id, { color: e.target.value } as Partial<CanvasElement>)}
          className="h-9 w-12 p-1"
        />
        <Input
          value={el.color}
          onChange={(e) => updateElement(el.id, { color: e.target.value } as Partial<CanvasElement>)}
          className="h-9 text-xs"
        />
      </div>
      <Label className="text-[10px] text-muted-foreground mt-2">Grubość kreski: {el.strokeWidth}</Label>
      <Slider
        value={[el.strokeWidth]}
        min={0.5}
        max={5}
        step={0.25}
        onValueChange={(v) => updateElement(el.id, { strokeWidth: v[0] } as Partial<CanvasElement>)}
        onValueCommit={commit}
        className="mt-1"
      />
    </Section>
  );
}

function LayersPanel() {
  const page = useEditor((s) => s.getCurrentPage());
  const select = useEditor((s) => s.select);
  const selectedIds = useEditor((s) => s.selectedIds);
  const toggleLock = useEditor((s) => s.toggleLock);
  const toggleVisibility = useEditor((s) => s.toggleVisibility);

  if (!page) return null;
  // top layer first
  const els = [...page.elements].reverse();

  return (
    <div className="p-2 space-y-1">
      {els.length === 0 && (
        <div className="text-xs text-muted-foreground text-center py-8">
          Brak elementów
        </div>
      )}
      {els.map((el) => (
        <div
          key={el.id}
          onClick={() => select(el.id, false)}
          className={cn(
            "flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-accent text-xs",
            selectedIds.includes(el.id) && "bg-accent"
          )}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleVisibility(el.id);
            }}
            className="p-1 hover:bg-muted rounded"
          >
            {el.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLock(el.id);
            }}
            className="p-1 hover:bg-muted rounded"
          >
            {el.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </button>
          <span className="flex-1 truncate capitalize">
            {el.name || labelForType(el.type)}
          </span>
        </div>
      ))}
    </div>
  );
}

function labelForType(t: string) {
  const map: Record<string, string> = {
    text: "Tekst",
    rectangle: "Prostokąt",
    ellipse: "Elipsa",
    triangle: "Trójkąt",
    line: "Linia",
    polygon: "Wielokąt",
    arrow: "Strzałka",
    image: "Obraz",
    icon: "Ikona",
    group: "Grupa",
  };
  return map[t] || t;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded border hover:border-primary hover:bg-accent flex items-center justify-center",
        active && "bg-primary text-primary-foreground border-primary hover:bg-primary"
      )}
    >
      {children}
    </button>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  onCommit: () => void;
}) {
  return (
    <div>
      <Label className="text-[10px] text-muted-foreground">
        {label}: {Math.round(value * 100) / 100}
      </Label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        onValueCommit={onCommit}
        className="mt-1"
      />
    </div>
  );
}
