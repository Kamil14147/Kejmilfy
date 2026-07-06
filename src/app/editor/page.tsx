"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession, login, register, logout } from "@/lib/use-session";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useEditor } from "@/lib/canvas/store";

// Lazy-load the Editor — it's a heavy component (canvas, all panels, LiveCursors, etc.)
// This keeps the initial JS bundle small and shows a loading state instantly.
const Editor = dynamic(
  () => import("@/components/editor/Editor").then((m) => m.Editor),
  {
    loading: () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Ładowanie edytora…</p>
        </div>
      </div>
    ),
    ssr: false, // Editor is fully client-side — no need to SSR
  }
);

export default function EditorPage() {
  const router = useRouter();
  const { user: session, status } = useSession();
  const project = useEditor((s) => s.project);

  // Single useEffect for all redirects — avoids "Cannot update component while rendering"
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth");
    } else if (status === "authenticated" && !project) {
      router.replace("/dashboard");
    }
  }, [status, project, router]);

  // autosave to backend on changes (debounced)
  React.useEffect(() => {
    if (!project || status !== "authenticated") return;
    const t = setTimeout(async () => {
      try {
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project }),
        });
      } catch (e) {
        console.error("autosave failed", e);
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [project, status]);

  // Loading or no project — show spinner (redirect handled by useEffect above)
  if (status === "loading" || !session || (status === "authenticated" && !project)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Editor onExit={() => router.push("/dashboard")} />;
}
