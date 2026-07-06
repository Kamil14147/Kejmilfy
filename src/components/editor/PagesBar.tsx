"use client";

import * as React from "react";
import { useEditor } from "@/lib/canvas/store";
import { Page } from "@/lib/canvas/types";
import { Plus, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { renderPageToDataUrl } from "@/lib/canvas/export";

export function PagesBar() {
  const project = useEditor((s) => s.project);
  const currentPageId = useEditor((s) => s.currentPageId);
  const setCurrentPage = useEditor((s) => s.setCurrentPage);
  const addPage = useEditor((s) => s.addPage);
  const duplicatePage = useEditor((s) => s.duplicatePage);
  const deletePage = useEditor((s) => s.deletePage);

  if (!project) return null;

  return (
    <div className="h-28 border-t bg-background flex items-center gap-3 px-3 overflow-x-auto">
      {project.pages.map((page, idx) => (
        <PageThumb
          key={page.id}
          page={page}
          index={idx}
          isActive={page.id === currentPageId}
          onClick={() => setCurrentPage(page.id)}
          onDuplicate={() => duplicatePage(page.id)}
          onDelete={() => {
            if (project.pages.length <= 1) {
              toast.error("Nie można usunąć ostatniej strony");
              return;
            }
            deletePage(page.id);
          }}
        />
      ))}
      <button
        onClick={addPage}
        className="flex-shrink-0 w-24 h-full rounded-lg border-2 border-dashed flex items-center justify-center hover:border-primary hover:bg-accent/50 transition-colors"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

function PageThumb({
  page,
  index,
  isActive,
  onClick,
  onDuplicate,
  onDelete,
}: {
  page: Page;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [thumb, setThumb] = React.useState<string | null>(null);
  const aspect = page.width / page.height;
  const thumbW = 80;
  const thumbH = thumbW / aspect;

  React.useEffect(() => {
    let cancelled = false;
    renderPageToDataUrl(page, "jpg", { scale: 0.2 })
      .then((url) => {
        if (!cancelled) setThumb(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        className={cn(
          "relative rounded-md overflow-hidden border-2 transition-all",
          isActive ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
        )}
        style={{ width: thumbW, height: thumbH }}
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={page.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted animate-pulse" />
        )}
      </button>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted-foreground">{index + 1}</span>
        <button onClick={onDuplicate} className="p-0.5 hover:bg-accent rounded" title="Duplikuj">
          <Copy className="h-3 w-3" />
        </button>
        <button onClick={onDelete} className="p-0.5 hover:bg-accent rounded" title="Usuń">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
