"use client";

import * as React from "react";
import { TopBar } from "./topbar/TopBar";
import { LeftSidebar } from "./panels/LeftSidebar";
import { RightSidebar } from "./panels/RightSidebar";
import { CanvasStage } from "./canvas/CanvasStage";
import { PagesBar } from "./PagesBar";
import { CommentsOverlay } from "./CommentsOverlay";
import { useEditor } from "@/lib/canvas/store";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ToastProvider } from "@/components/ui/toast";
import { PanelLeft, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorProps {
  onExit: () => void;
}

export function Editor({ onExit }: EditorProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [leftOpen, setLeftOpen] = React.useState(true);
  const [rightOpen, setRightOpen] = React.useState(true);
  const project = useEditor((s) => s.project);
  const currentPageId = useEditor((s) => s.currentPageId);
  useKeyboardShortcuts();

  // Auto-collapse panels on small screens
  React.useEffect(() => {
    const check = () => {
      if (window.innerWidth < 1024) {
        setLeftOpen(false);
        setRightOpen(false);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!project) return null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopBar onExit={onExit} />
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile toggles */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-2 z-50 lg:hidden"
          onClick={() => {
            setLeftOpen(!leftOpen);
            if (!leftOpen) setRightOpen(false);
          }}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-50 lg:hidden"
          onClick={() => {
            setRightOpen(!rightOpen);
            if (!rightOpen) setLeftOpen(false);
          }}
        >
          <PanelRight className="h-4 w-4" />
        </Button>

        {/* Left sidebar */}
        <div
          className={`${
            leftOpen ? "block" : "hidden"
          } lg:block absolute lg:relative z-40 lg:z-auto h-full lg:h-auto`}
        >
          <LeftSidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <CanvasStage editingId={editingId} setEditingId={setEditingId} />
          <PagesBar />
          {project && currentPageId && (
            <CommentsOverlay projectId={project.id} pageId={currentPageId} />
          )}
        </div>

        {/* Right sidebar */}
        <div
          className={`${
            rightOpen ? "block" : "hidden"
          } lg:block absolute lg:relative right-0 z-40 lg:z-auto h-full lg:h-auto`}
        >
          <RightSidebar />
        </div>

        {/* Backdrop on mobile when sidebar open */}
        {(leftOpen || rightOpen) && (
          <div
            className="absolute inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => {
              setLeftOpen(false);
              setRightOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
