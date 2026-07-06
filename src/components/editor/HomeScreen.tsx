"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useEditor, listProjects, trashProject, toggleFavorite } from "@/lib/canvas/store";
import { PROJECT_SIZES, getCategories, getCategorySizes, Project, newProject } from "@/lib/canvas/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Star, Trash2, Folder, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserMenu, useUser } from "@/components/editor/UserMenu";

interface Props {
  onOpenEditor: () => void;
}

export function HomeScreen({ onOpenEditor }: Props) {
  const [view, setView] = React.useState<"home" | "new">("home");
  const [search, setSearch] = React.useState("");
  const [projects, setProjects] = React.useState<Project[]>([]);
  const loadProject = useEditor((s) => s.loadProject);

  const refresh = React.useCallback(() => {
    setProjects(listProjects());
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.deleted
  );
  const favorites = filtered.filter((p) => p.favorite);
  const recent = filtered.filter((p) => !p.favorite).slice(0, 12);

  const openProject = (p: Project) => {
    loadProject(JSON.parse(JSON.stringify(p)));
    onOpenEditor();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              C
            </div>
            kejmilfy
          </div>
          <div className="flex-1" />
          <Button variant="ghost" size="sm">
            <Folder className="h-4 w-4 mr-1" /> Foldery
          </Button>
          <Button variant="ghost" size="sm">
            <Clock className="h-4 w-4 mr-1" /> Kosz
          </Button>
          <UserMenu />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {view === "home" ? (
          <>
            {/* Hero */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Co dziś <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">stworzymy</span>?
              </h1>
              <p className="text-muted-foreground">
                Wybierz format i zacznij projektować w pełni funkcjonalnym edytorze graficznym
              </p>
            </div>

            {/* Quick create */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
              <button
                onClick={() => setView("new")}
                className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-accent/50 transition-colors group"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-medium">Nowy projekt</span>
              </button>
              {PROJECT_SIZES.slice(0, 5).map((size) => (
                <QuickSizeCard key={size.id} size={size} onOpen={() => {
                  const p = newProject(size, size.name);
                  loadProject(p);
                  onOpenEditor();
                }} />
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj projektów..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> Ulubione
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {favorites.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onOpen={() => openProject(p)}
                      onToggleFav={() => {
                        toggleFavorite(p.id);
                        refresh();
                      }}
                      onTrash={() => {
                        trashProject(p.id);
                        refresh();
                        toast.success("Przeniesiono do kosza");
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recent */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Ostatnie projekty</h2>
              {recent.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">
                  Brak projektów. Kliknij „Nowy projekt”, aby zacząć.
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {recent.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onOpen={() => openProject(p)}
                      onToggleFav={() => {
                        toggleFavorite(p.id);
                        refresh();
                      }}
                      onTrash={() => {
                        trashProject(p.id);
                        refresh();
                        toast.success("Przeniesiono do kosza");
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <NewProjectView onBack={() => setView("home")} onCreate={(p) => openProject(p)} />
        )}
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          kejmilfy — edytor graficzny online • Zbudowano z Next.js + Zustand + Tailwind
        </div>
      </footer>
    </div>
  );
}

function QuickSizeCard({ size, onOpen }: { size: typeof PROJECT_SIZES[number]; onOpen: () => void }) {
  const aspect = size.width / size.height;
  return (
    <button
      onClick={onOpen}
      className="aspect-square rounded-xl border flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-accent/50 transition-colors p-2"
    >
      <div
        className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded"
        style={{
          width: aspect > 1 ? 40 : 40 * aspect,
          height: aspect > 1 ? 40 / aspect : 40,
          maxHeight: 50,
          maxWidth: 50,
        }}
      />
      <span className="text-[10px] text-center font-medium line-clamp-2">{size.name}</span>
    </button>
  );
}

function ProjectCard({
  project,
  onOpen,
  onToggleFav,
  onTrash,
}: {
  project: Project;
  onOpen: () => void;
  onToggleFav: () => void;
  onTrash: () => void;
}) {
  const page = project.pages[0];
  const aspect = page.width / page.height;
  return (
    <div className="group relative rounded-lg border overflow-hidden bg-card hover:border-primary transition-colors">
      <button
        onClick={onOpen}
        className="block w-full"
        style={{ aspectRatio: aspect }}
      >
        <div
          className="w-full h-full"
          style={{
            background:
              page.background?.type === "gradient"
                ? `linear-gradient(${page.background.gradient?.angle}deg, ${page.background.gradient?.from}, ${page.background.gradient?.to})`
                : page.background?.color || "#fff",
          }}
        >
          {/* Tiny preview of elements */}
          <svg viewBox={`0 0 ${page.width} ${page.height}`} className="w-full h-full">
            {page.elements.slice(0, 8).map((el) => {
              if (el.type === "text") {
                return (
                  <text
                    key={el.id}
                    x={el.x + el.width / 2}
                    y={el.y + el.fontSize}
                    textAnchor="middle"
                    fontSize={el.fontSize}
                    fontWeight={el.fontWeight}
                    fill={el.color}
                    fontFamily={el.fontFamily}
                  >
                    {el.text.slice(0, 20)}
                  </text>
                );
              }
              if (el.type === "rectangle" || el.type === "ellipse") {
                return el.type === "ellipse" ? (
                  <ellipse
                    key={el.id}
                    cx={el.x + el.width / 2}
                    cy={el.y + el.height / 2}
                    rx={el.width / 2}
                    ry={el.height / 2}
                    fill={(el as any).fill}
                  />
                ) : (
                  <rect
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    fill={(el as any).fill}
                    rx={(el as any).radius || 0}
                  />
                );
              }
              return null;
            })}
          </svg>
        </div>
      </button>
      <div className="p-2">
        <div className="text-xs font-medium truncate">{project.name}</div>
        <div className="text-[10px] text-muted-foreground">
          {new Date(project.updatedAt).toLocaleDateString("pl-PL")}
        </div>
      </div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
        <button
          onClick={onToggleFav}
          className="p-1 rounded bg-background/80 backdrop-blur hover:bg-background"
        >
          <Star className={cn("h-3 w-3", project.favorite && "fill-yellow-500 text-yellow-500")} />
        </button>
        <button
          onClick={onTrash}
          className="p-1 rounded bg-background/80 backdrop-blur hover:bg-background"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function NewProjectView({ onBack, onCreate }: { onBack: () => void; onCreate: (p: Project) => void }) {
  const [customW, setCustomW] = React.useState(1080);
  const [customH, setCustomH] = React.useState(1080);
  const [name, setName] = React.useState("");
  const loadProject = useEditor((s) => s.loadProject);

  const cats = getCategories();

  const create = (size: typeof PROJECT_SIZES[number]) => {
    const p = newProject(size, name || size.name);
    loadProject(p);
    onCreate(p);
  };

  const createCustom = () => {
    const size = {
      id: "custom",
      name: "Custom",
      width: Math.max(50, customW),
      height: Math.max(50, customH),
      category: "Custom",
    };
    const p = newProject(size, name || "Custom design");
    loadProject(p);
    onCreate(p);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nowy projekt</h1>
        <Button variant="ghost" onClick={onBack}>← Wróć</Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Nazwa projektu (opcjonalnie)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-md"
        />
      </div>

      {cats.map((cat) => (
        <div key={cat} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{cat}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {getCategorySizes(cat).map((size) => {
              const aspect = size.width / size.height;
              return (
                <button
                  key={size.id}
                  onClick={() => create(size)}
                  className="group rounded-lg border p-4 hover:border-primary hover:bg-accent/50 transition-colors flex flex-col items-center gap-2"
                >
                  <div
                    className="border-2 border-muted-foreground/30 group-hover:border-primary rounded"
                    style={{
                      width: aspect > 1 ? 60 : 60 * aspect,
                      height: aspect > 1 ? 60 / aspect : 60,
                      maxHeight: 70,
                      maxWidth: 70,
                    }}
                  />
                  <span className="text-xs font-medium text-center">{size.name}</span>
                  <span className="text-[10px] text-muted-foreground">{size.width}×{size.height}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Własny rozmiar</h2>
        <div className="flex items-end gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Szerokość (px)</label>
            <Input
              type="number"
              value={customW}
              onChange={(e) => setCustomW(+e.target.value)}
              className="w-32"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Wysokość (px)</label>
            <Input
              type="number"
              value={customH}
              onChange={(e) => setCustomH(+e.target.value)}
              className="w-32"
            />
          </div>
          <Button onClick={createCustom}>Utwórz</Button>
        </div>
      </div>
    </div>
  );
}
