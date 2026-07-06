"use client";

import * as React from "react";
import {
  Undo2,
  Redo2,
  Save,
  Download,
  ChevronDown,
  Grid3x3,
  Ruler,
  Magnet,
  Play,
  Eye,
  MoreHorizontal,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useEditor } from "@/lib/canvas/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { exportPage, ExportFormat } from "@/lib/canvas/export";
import { ShareDialog } from "@/components/editor/ShareDialog";
import { ThemeToggle } from "@/components/editor/ThemeToggle";
import { ActivityFeed, logActivity } from "@/components/editor/ActivityFeed";
import { ConnectivityIndicator } from "@/components/editor/ConnectivityIndicator";
import { CollabStatus } from "@/components/editor/CollabStatus";
import { ElementRenderer } from "@/components/editor/canvas/ElementRenderer";

interface TopBarProps {
  onExit: () => void;
}

export function TopBar({ onExit }: TopBarProps) {
  const project = useEditor((s) => s.project);
  const setProjectName = useEditor((s) => s.setProjectName);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const canUndo = useEditor((s) => s.historyIndex > 0);
  const canRedo = useEditor((s) => s.historyIndex < s.history.length - 1);
  const showGrid = useEditor((s) => s.showGrid);
  const showRulers = useEditor((s) => s.showRulers);
  const snapToGrid = useEditor((s) => s.snapToGrid);
  const toggleGrid = useEditor((s) => s.toggleGrid);
  const toggleRulers = useEditor((s) => s.toggleRulers);
  const toggleSnap = useEditor((s) => s.toggleSnap);
  const saveToStorage = useEditor((s) => s.saveToStorage);
  const lastSavedAt = useEditor((s) => s.lastSavedAt);
  const isDirty = useEditor((s) => s.isDirty);

  const [exporting, setExporting] = React.useState(false);
  const [presentOpen, setPresentOpen] = React.useState(false);

  // auto save
  React.useEffect(() => {
    if (!project || !isDirty) return;
    const t = setTimeout(() => {
      saveToStorage();
    }, 3000);
    return () => clearTimeout(t);
  }, [project, isDirty, saveToStorage]);

  if (!project) return null;

  const handleExport = async (format: ExportFormat, opts?: { transparent?: boolean; scale?: number }) => {
    setExporting(true);
    try {
      const page = useEditor.getState().getCurrentPage();
      if (!page) return;
      const blob = await exportPage(page, format, opts);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.replace(/[^a-z0-9]+/gi, "_")}_${page.name}.${format === "jpg" ? "jpg" : format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Wyeksportowano do ${format.toUpperCase()}`);
    } catch (e) {
      console.error(e);
      toast.error("Eksport nieudany");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-12 border-b bg-background flex items-center gap-2 px-3 z-30">
      <button
        onClick={onExit}
        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent text-sm font-semibold"
      >
        <div className="h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs">
          C
        </div>
        kejmilfy
      </button>

      <div className="h-6 w-px bg-border" />

      <Input
        value={project.name}
        onChange={(e) => setProjectName(e.target.value)}
        className="h-8 w-48 text-sm border-none bg-transparent hover:bg-accent focus-visible:bg-accent focus-visible:border"
      />

      <div className="text-[10px] text-muted-foreground">
        <ConnectivityIndicator />
      </div>

      <div className="flex-1" />

      {/* History */}
      <div className="flex items-center gap-0.5">
        <IconBtn disabled={!canUndo} onClick={undo} title="Cofnij (Ctrl+Z)">
          <Undo2 className="h-4 w-4" />
        </IconBtn>
        <IconBtn disabled={!canRedo} onClick={redo} title="Ponów (Ctrl+Shift+Z)">
          <Redo2 className="h-4 w-4" />
        </IconBtn>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* View toggles */}
      <div className="flex items-center gap-0.5">
        <IconBtn active={showRulers} onClick={toggleRulers} title="Linijki">
          <Ruler className="h-4 w-4" />
        </IconBtn>
        <IconBtn active={showGrid} onClick={toggleGrid} title="Siatka">
          <Grid3x3 className="h-4 w-4" />
        </IconBtn>
        <IconBtn active={snapToGrid} onClick={toggleSnap} title="Przyciąganie">
          <Magnet className="h-4 w-4" />
        </IconBtn>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Present */}
      <Dialog open={presentOpen} onOpenChange={setPresentOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            <Play className="h-4 w-4" /> Prezentuj
          </Button>
        </DialogTrigger>
        <PresentDialog />
      </Dialog>

      {/* Share */}
      <ShareDialog />

      {/* Collab status */}
      <CollabStatus />

      {/* Activity */}
      <div className="relative">
        <ActivityFeed projectId={project.id} />
      </div>

      {/* Theme */}
      <ThemeToggle />

      {/* Save */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          saveToStorage();
          toast.success("Zapisano");
        }}
        className="gap-1"
      >
        <Save className="h-4 w-4" /> Zapisz
      </Button>

      {/* Export */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="gap-1" disabled={exporting}>
            <Download className="h-4 w-4" />
            {exporting ? "Eksport..." : "Eksportuj"}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Pobierz jako</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport("png")}>
            PNG (przezroczyste)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("jpg")}>
            JPG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("svg")}>
            SVG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("png", { scale: 2 })}>
            PNG @2x (HD)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExportPdf()}>
            PDF (wszystkie strony)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  async function handleExportPdf() {
    setExporting(true);
    try {
      if (!project) return;
      const { exportProjectToPdf } = await import("@/lib/canvas/export");
      const blob = await exportProjectToPdf(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.replace(/[^a-z0-9]+/gi, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF wygenerowany");
    } catch (e) {
      console.error(e);
      toast.error("Eksport PDF nieudany");
    } finally {
      setExporting(false);
    }
  }
}

function PresentDialog() {
  const project = useEditor((s) => s.project);
  const [idx, setIdx] = React.useState(0);
  const pages = project?.pages || [];

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setIdx((i) => Math.min(pages.length - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [pages.length]);

  if (!project) return null;
  const page = pages[idx];
  if (!page) return null;

  return (
    <DialogContent
      className="p-0 overflow-hidden gap-0 max-w-none"
      style={{ width: "95vw", height: "95vh", maxWidth: "1800px" }}
      aria-describedby={undefined}
    >
      {/* Visually hidden title for accessibility (Radix requires DialogTitle) */}
      <DialogTitle className="sr-only">Prezentacja — slajd {idx + 1} z {pages.length}</DialogTitle>
      <div className="bg-black flex items-center justify-center flex-1" style={{ height: "calc(95vh - 60px)" }}>
        <PresentPagePreview page={page} />
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-background border-t" style={{ height: "60px" }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
        >
          ← Poprzedni
        </Button>
        <div className="flex items-center gap-3">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === idx ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Slajd ${i + 1}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {idx + 1} / {pages.length}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIdx(Math.min(pages.length - 1, idx + 1))}
          disabled={idx === pages.length - 1}
        >
          Następny →
        </Button>
      </div>
    </DialogContent>
  );
}

/**
 * Renders a page at native size, then scales it down to fit the container.
 * Uses the same ElementRenderer as the editor — so everything looks identical.
 *
 * The trick: wrap the native-size page in a box that has the SCALED dimensions.
 * That way the browser reserves the right amount of space and flexbox centers
 * the visible (scaled) box — instead of the original (1080×1080) box.
 */
function PresentPagePreview({ page }: { page: any }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.3);

  React.useEffect(() => {
    const compute = () => {
      if (!containerRef.current) return;
      // Use the parent's parent (DialogContent body) for real available size
      const container = containerRef.current.parentElement?.parentElement || containerRef.current;
      const maxW = container.clientWidth - 60;
      const maxH = container.clientHeight - 60;
      if (maxW <= 0 || maxH <= 0) return;
      const s = Math.min(maxW / page.width, maxH / page.height);
      setScale(s > 0 && s <= 1 ? s : s > 1 ? 1 : 0.1);
    };
    // Delay to let DialogContent finish opening animation
    const t = setTimeout(compute, 50);
    window.addEventListener("resize", compute);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", compute);
    };
  }, [page.width, page.height]);

  // Background style
  const bg = page.background || { type: "color", color: "#fff" };
  let bgStyle: React.CSSProperties = { background: bg.color };
  if (bg.type === "gradient" && bg.gradient) {
    bgStyle = { background: `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})` };
  } else if (bg.type === "image" && bg.imageSrc) {
    bgStyle = { backgroundImage: `url(${bg.imageSrc})`, backgroundSize: "cover", backgroundPosition: "center" };
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      {/* Outer wrapper — has the SCALED dimensions so layout reserves the right amount of space */}
      <div
        style={{
          width: page.width * scale,
          height: page.height * scale,
          position: "relative",
          flexShrink: 0,
          boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Inner: native-size page scaled to fit the outer wrapper */}
        <div
          style={{
            width: page.width,
            height: page.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
            ...bgStyle,
            overflow: "hidden",
          }}
        >
          {page.elements
            .filter((el: any) => el.visible !== false)
            .map((el: any) => (
              <ElementRenderer key={el.id} element={el} />
            ))}
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        "p-2 rounded hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed",
        active && "bg-accent text-primary"
      )}
    >
      {children}
    </button>
  );
}
