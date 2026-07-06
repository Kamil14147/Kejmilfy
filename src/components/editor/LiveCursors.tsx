"use client";

import * as React from "react";
import { useSession, login, register, logout } from "@/lib/use-session";
import { getSupabaseBrowser } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2 } from "lucide-react";
import { useEditor } from "@/lib/canvas/store";

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  userColor: string;
  ts: number;
}

interface PresenceState {
  userId: string;
  userName: string;
  userColor: string;
  ts: number;
}

interface Props {
  projectId: string;
  canvasPageRef: React.RefObject<HTMLElement>;
  zoom: number;
}

/**
 * Live cursors + presence + project-change sync.
 * Uses Supabase Realtime broadcast + presence channels.
 */
export function LiveCursors({ projectId, canvasPageRef, zoom }: Props) {
  const { user: session } = useSession();
  const [cursors, setCursors] = React.useState<Map<string, CursorPosition>>(new Map());
  const [online, setOnline] = React.useState<PresenceState[]>([]);
  const channelRef = React.useRef<RealtimeChannel | null>(null);
  const lastBroadcast = React.useRef(0);

  // Store actions for applying remote changes
  const loadProject = useEditor((s) => s.loadProject);
  const project = useEditor((s) => s.project);
  const isDirty = useEditor((s) => s.isDirty);
  const beginBatch = useEditor((s) => s.beginBatch);
  const commitBatch = useEditor((s) => s.commitBatch);
  const updateElement = useEditor((s) => s.updateElement);
  const addElement = useEditor((s) => s.addElement);
  const deleteElements = useEditor((s) => s.deleteElements);

  React.useEffect(() => {
    if (!session) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const me = {
      userId: session.id,
      userName: session.name || "Anonim",
      userColor: session.avatarColor || "#6366f1",
    };

    const channel = supabase.channel(`project:${projectId}`, {
      config: { presence: { key: me.userId } },
    });
    channelRef.current = channel;

    // 1. Cursor broadcasts
    channel.on("broadcast", { event: "cursor" }, (payload: any) => {
      const c = payload.payload as CursorPosition;
      if (c.userId === me.userId) return;
      setCursors((prev) => {
        const next = new Map(prev);
        next.set(c.userId, c);
        return next;
      });
    });

    // 2. Element change broadcasts (other users editing)
    channel.on("broadcast", { event: "element-update" }, (payload: any) => {
      const { elementId, patch, userId } = payload.payload || {};
      if (userId === me.userId) return;
      updateElement(elementId, patch);
    });
    channel.on("broadcast", { event: "element-add" }, (payload: any) => {
      const { element, userId } = payload.payload || {};
      if (userId === me.userId) return;
      // avoid duplicate
      const existing = useEditor.getState().getElement(element.id);
      if (!existing) addElement(element);
    });
    channel.on("broadcast", { event: "element-delete" }, (payload: any) => {
      const { ids, userId } = payload.payload || {};
      if (userId === me.userId) return;
      deleteElements(ids);
    });

    // 3. Project save notifications — refetch
    let lastRefetch = 0;
    channel.on("broadcast", { event: "project-change" }, async (payload: any) => {
      const { userId, kind } = payload.payload || {};
      if (userId === me.userId) return;
      // Debounce refetches
      const now = Date.now();
      if (now - lastRefetch < 1500) return;
      lastRefetch = now;
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.project) {
          // Preserve current page selection
          const cur = useEditor.getState().currentPageId;
          loadProject(data.project);
          if (cur && data.project.pages.find((p: any) => p.id === cur)) {
            useEditor.setState({ currentPageId: cur });
          }
        }
      } catch (e) {
        console.warn("refetch failed", e);
      }
    });

    // 4. Comment broadcasts
    channel.on("broadcast", { event: "comment-added" }, (payload: any) => {
      // CommentsOverlay listens to this via a custom event
      window.dispatchEvent(
        new CustomEvent("kejmilfy-comment-added", { detail: payload.payload })
      );
    });

    // 5. Presence sync
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceState>();
        const list: PresenceState[] = [];
        Object.values(state).forEach((arr) => {
          if (arr[0]) list.push(arr[0]);
        });
        setOnline(list);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ ...me, ts: Date.now() } as PresenceState);
        }
      });

    // Cleanup stale cursors
    const cleanupInterval = setInterval(() => {
      setCursors((prev) => {
        const next = new Map();
        const now = Date.now();
        prev.forEach((c, k) => {
          if (now - c.ts < 5000) next.set(k, c);
        });
        return next;
      });
    }, 2000);

    return () => {
      clearInterval(cleanupInterval);
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [projectId, session, loadProject, updateElement, addElement, deleteElements]);

  // Broadcast cursor movement (throttled to 20fps)
  React.useEffect(() => {
    const root = canvasPageRef.current?.closest("[data-canvas-root]") as HTMLElement | null;
    if (!root) return;
    const handler = (e: PointerEvent) => {
      const supabase = getSupabaseBrowser();
      if (!supabase || !session || !canvasPageRef.current || !channelRef.current) return;
      const now = Date.now();
      if (now - lastBroadcast.current < 50) return;
      lastBroadcast.current = now;
      const rect = canvasPageRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      channelRef.current.send({
        type: "broadcast",
        event: "cursor",
        payload: {
          x, y,
          userId: session.id,
          userName: session.name || "Anonim",
          userColor: session.avatarColor || "#6366f1",
          ts: now,
        },
      });
    };
    root.addEventListener("pointermove", handler);
    return () => root.removeEventListener("pointermove", handler);
  }, [session, zoom, canvasPageRef]);

  if (!session) return null;

  return (
    <>
      {/* Remote cursors */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 25 }}>
        <AnimatePresence>
          {Array.from(cursors.values()).map((c) => (
            <motion.div
              key={c.userId}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                left: c.x,
                top: c.y,
                transform: `scale(${1 / zoom})`,
                transformOrigin: "top left",
                pointerEvents: "none",
              }}
            >
              <MousePointer2
                className="h-5 w-5 drop-shadow-md"
                style={{ color: c.userColor, fill: "white" }}
              />
              <div
                className="absolute left-3 top-3 px-1.5 py-0.5 rounded text-[10px] text-white font-medium whitespace-nowrap shadow-md"
                style={{ background: c.userColor }}
              >
                {c.userName}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Online avatars */}
      <div className="absolute top-2 right-2 z-30 flex items-center -space-x-2 pointer-events-none">
        {online.slice(0, 5).map((u) => (
          <div
            key={u.userId}
            className="h-7 w-7 rounded-full border-2 border-background flex items-center justify-center text-white text-[10px] font-semibold shadow-md"
            style={{ background: u.userColor }}
            title={`${u.userName} • online`}
          >
            {u.userName[0]?.toUpperCase()}
          </div>
        ))}
        {online.length > 5 && (
          <div className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-semibold">
            +{online.length - 5}
          </div>
        )}
        {online.length > 0 && (
          <div className="ml-3 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {online.length} online
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Broadcast an element change to other editors via the project's Realtime channel.
 * Call this after element updates to sync multiplayer.
 */
export function useBroadcastElementChange(projectId: string) {
  const { user: session } = useSession();
  return React.useCallback(
    (event: "element-update" | "element-add" | "element-delete", payload: any) => {
      const supabase = getSupabaseBrowser();
      if (!supabase || !session) return;
      const channel = supabase.channel(`project:${projectId}`);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event,
            payload: { ...payload, userId: session.id },
          });
        }
      });
    },
    [projectId, session]
  );
}
