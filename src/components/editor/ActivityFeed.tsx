"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, MessageSquare, Pencil, Eye, Share2 } from "lucide-react";

export interface Activity {
  id: string;
  type: "edit" | "comment" | "view" | "share";
  user: string;
  userColor: string;
  action: string;
  timestamp: number;
}

const STORAGE_KEY = "canvas_activity";

export function logActivity(projectId: string, a: Omit<Activity, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${projectId}`);
    const arr: Activity[] = raw ? JSON.parse(raw) : [];
    arr.unshift({ ...a, id: `a_${Math.random().toString(36).slice(2, 8)}`, timestamp: Date.now() });
    localStorage.setItem(`${STORAGE_KEY}_${projectId}`, JSON.stringify(arr.slice(0, 50)));
    window.dispatchEvent(new Event("canvas-activity-changed"));
  } catch {}
}

export function getActivities(projectId: string): Activity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${projectId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function ActivityFeed({ projectId }: { projectId: string }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Activity[]>([]);

  React.useEffect(() => {
    setItems(getActivities(projectId));
    const h = () => setItems(getActivities(projectId));
    window.addEventListener("canvas-activity-changed", h);
    return () => window.removeEventListener("canvas-activity-changed", h);
  }, [projectId]);

  const icon = (type: Activity["type"]) => {
    switch (type) {
      case "edit":
        return <Pencil className="h-3 w-3" />;
      case "comment":
        return <MessageSquare className="h-3 w-3" />;
      case "view":
        return <Eye className="h-3 w-3" />;
      case "share":
        return <Share2 className="h-3 w-3" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded hover:bg-accent"
        title="Aktywność"
      >
        <Bell className="h-4 w-4" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-background border rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="p-2 border-b font-semibold text-xs">Aktywność w projekcie</div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2 max-h-80">
              {items.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-8">
                  Brak aktywności
                </div>
              )}
              {items.map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-xs">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback style={{ background: a.userColor }} className="text-white text-[10px]">
                      {a.user[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{a.user}</span>
                      <span className="text-muted-foreground">{icon(a.type)}</span>
                    </div>
                    <div className="text-muted-foreground">{a.action}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(a.timestamp).toLocaleString("pl-PL")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </>
  );
}
