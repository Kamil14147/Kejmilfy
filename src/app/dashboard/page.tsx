"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession, login, register, logout } from "@/lib/use-session";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Star,
  Trash2,
  Folder,
  Clock,
  LogOut,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ParticleField } from "@/components/ParticleField";
import { useEditor } from "@/lib/canvas/store";
import { PROJECT_SIZES, getCategories, getCategorySizes, Project, newProject } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ProjectMeta {
  id: string;
  name: string;
  thumbnail?: string | null;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user: session, status } = useSession();
  const [projects, setProjects] = React.useState<ProjectMeta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [showNew, setShowNew] = React.useState(false);
  const loadProject = useEditor((s) => s.loadProject);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }
    if (status === "authenticated") {
      fetchProjects();
    }
  }, [status, router]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProjects(data.projects);
    } catch {
      toast.error("Nie udało się pobrać projektów");
    } finally {
      setLoading(false);
    }
  };

  const openProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      loadProject(data.project);
      router.push("/editor");
    } catch {
      toast.error("Nie udało się otworzyć projektu");
    }
  };

  const toggleFav = async (id: string, fav: boolean) => {
    setProjects((p) => p.map((x) => (x.id === id ? { ...x, favorite: !fav } : x)));
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: !fav }),
    });
  };

  const trash = async (id: string, name: string) => {
    if (!confirm(`Usunąć projekt "${name}"? Tej operacji nie można cofnąć.`)) return;
    setProjects((p) => p.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Projekt usunięty");
    } catch {
      toast.error("Nie udało się usunąć projektu");
      fetchProjects(); // restore on error
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!session) return null;

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const favorites = filtered.filter((p) => p.favorite);
  const recent = filtered.filter((p) => !p.favorite);

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white relative overflow-hidden">
      <ParticleField count={25} colors={["#6366f1", "#8b5cf6"]} />

      {/* Header */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-black/30 sticky top-0"
      >
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30"
            >
              C
            </motion.div>
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              kejmilfy
            </span>
          </Link>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Folder className="h-4 w-4 mr-1" /> Foldery
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Clock className="h-4 w-4 mr-1" /> Kosz
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ background: session.avatarColor || "#6366f1" }}
            >
              {(session.name || session.email)[0].toUpperCase()}
            </div>
            <span className="text-sm hidden sm:inline">{session.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => {
              fetch("/api/auth/signout", { method: "post" }).then(() => router.push("/"));
            }}
            title="Wyloguj"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </motion.header>

      <main className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Cześć, <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">{session.name}</span>!
          </h1>
          <p className="text-white/50">Co dziś zaprojektujemy?</p>
        </motion.div>

        {/* Quick create */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-10"
        >
          <button
            onClick={() => setShowNew(true)}
            className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-500/5 transition-colors group"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
            >
              <Plus className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xs font-medium">Nowy projekt</span>
          </button>
          {PROJECT_SIZES.slice(0, 5).map((size, i) => (
            <QuickSizeCard
              key={size.id}
              size={size}
              delay={i * 0.05}
              onOpen={() => createProject(size)}
            />
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <Input
              placeholder="Szukaj projektów..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-400"
            />
          </div>
        </motion.div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> Ulubione
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {favorites.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  delay={i * 0.05}
                  onOpen={() => openProject(p.id)}
                  onToggleFav={() => toggleFav(p.id, p.favorite)}
                  onTrash={() => trash(p.id, p.name)}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Recent */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-4">Wszystkie projekty</h2>
          {recent.length === 0 ? (
            <Card className="p-12 text-center text-white/40 border-white/10 bg-white/[0.02]">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-indigo-400" />
              Brak projektów. Kliknij „Nowy projekt”, aby zacząć.
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {recent.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  delay={i * 0.05}
                  onOpen={() => openProject(p.id)}
                  onToggleFav={() => toggleFav(p.id, p.favorite)}
                  onTrash={() => trash(p.id, p.name)}
                />
              ))}
            </div>
          )}
        </motion.section>
      </main>

      {/* New project modal */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-4xl bg-[#0a0a14] border-white/10 text-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Nowy projekt</DialogTitle>
          </DialogHeader>
          <NewProjectView
            onCreate={(size) => createProject(size)}
            onClose={() => setShowNew(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );

  async function createProject(size: typeof PROJECT_SIZES[number]) {
    const proj = newProject(size, size.name);
    // Save to DB
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: proj }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Nie udało się zapisać projektu");
    }
    loadProject(proj);
    router.push("/editor");
  }
}

function QuickSizeCard({
  size,
  delay,
  onOpen,
}: {
  size: typeof PROJECT_SIZES[number];
  delay: number;
  onOpen: () => void;
}) {
  const aspect = size.width / size.height;
  return (
    <motion.button
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      onClick={onOpen}
      className="aspect-square rounded-xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-500/5 transition-colors p-2"
    >
      <div
        className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded shadow-lg"
        style={{
          width: aspect > 1 ? 40 : 40 * aspect,
          height: aspect > 1 ? 40 / aspect : 40,
          maxHeight: 50,
          maxWidth: 50,
        }}
      />
      <span className="text-[10px] text-center font-medium line-clamp-2">{size.name}</span>
    </motion.button>
  );
}

function ProjectCard({
  project,
  delay,
  onOpen,
  onToggleFav,
  onTrash,
}: {
  project: ProjectMeta;
  delay: number;
  onOpen: () => void;
  onToggleFav: () => void;
  onTrash: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      className="group relative rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-indigo-400/50 transition-colors"
    >
      <button
        onClick={onOpen}
        className="block w-full aspect-[3/4] relative overflow-hidden"
      >
        {project.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnail}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <div className="text-2xl font-bold text-white/20">
              {project.name[0]?.toUpperCase()}
            </div>
          </div>
        )}
      </button>
      <div className="p-2">
        <div className="text-xs font-medium truncate">{project.name}</div>
        <div className="text-[10px] text-white/40">
          {new Date(project.updatedAt).toLocaleDateString("pl-PL")}
        </div>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
        <button
          onClick={onToggleFav}
          className="p-1.5 rounded-lg bg-black/60 backdrop-blur hover:bg-black/80"
        >
          <Star className={cn("h-3 w-3", project.favorite && "fill-yellow-400 text-yellow-400")} />
        </button>
        <button
          onClick={onTrash}
          className="p-1.5 rounded-lg bg-black/60 backdrop-blur hover:bg-red-500/80"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

function NewProjectView({
  onCreate,
  onClose,
}: {
  onCreate: (size: typeof PROJECT_SIZES[number]) => void;
  onClose: () => void;
}) {
  const cats = getCategories();
  const [customW, setCustomW] = React.useState(1080);
  const [customH, setCustomH] = React.useState(1080);

  const createCustom = () => {
    onCreate({
      id: "custom",
      name: "Custom",
      width: Math.max(50, customW),
      height: Math.max(50, customH),
      category: "Custom",
    } as any);
    onClose();
  };

  return (
    <div className="space-y-6">
      {cats.map((cat) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">{cat}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {getCategorySizes(cat).map((size) => {
              const aspect = size.width / size.height;
              return (
                <button
                  key={size.id}
                  onClick={() => {
                    onCreate(size);
                    onClose();
                  }}
                  className="group p-4 rounded-xl border border-white/10 hover:border-indigo-400 hover:bg-indigo-500/5 transition-colors flex flex-col items-center gap-2"
                >
                  <div
                    className="border-2 border-white/30 group-hover:border-indigo-400 rounded transition-colors"
                    style={{
                      width: aspect > 1 ? 50 : 50 * aspect,
                      height: aspect > 1 ? 50 / aspect : 50,
                      maxHeight: 60,
                      maxWidth: 60,
                    }}
                  />
                  <span className="text-xs font-medium text-center">{size.name}</span>
                  <span className="text-[10px] text-white/40">{size.width}×{size.height}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Własny rozmiar</h3>
        <div className="flex items-end gap-3">
          <div>
            <Label className="text-xs text-white/60">Szerokość (px)</Label>
            <Input
              type="number"
              value={customW}
              onChange={(e) => setCustomW(+e.target.value)}
              className="w-32 bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-white/60">Wysokość (px)</Label>
            <Input
              type="number"
              value={customH}
              onChange={(e) => setCustomH(+e.target.value)}
              className="w-32 bg-white/5 border-white/10 text-white"
            />
          </div>
          <Button
            onClick={createCustom}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
          >
            Utwórz
          </Button>
        </div>
      </div>
    </div>
  );
}
