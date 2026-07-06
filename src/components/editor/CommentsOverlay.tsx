"use client";

import * as React from "react";
import { useSession, login, register, logout } from "@/lib/use-session";
import { useEditor } from "@/lib/canvas/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, X, Reply, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

export interface Comment {
  id: string;
  x: number;
  y: number;
  author: string;
  authorColor: string;
  text: string;
  createdAt: number;
  replies: Array<{
    id: string;
    author: string;
    text: string;
    createdAt: number;
  }>;
  resolved?: boolean;
}

interface Props {
  projectId: string;
  pageId: string;
}

export function CommentsOverlay({ projectId, pageId }: Props) {
  const { user: session } = useSession();
  const zoom = useEditor((s) => s.zoom);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [replyDraft, setReplyDraft] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [placingMode, setPlacingMode] = React.useState(false);

  const fetchComments = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?projectId=${projectId}`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(data.comments.filter((c: any) => c.pageId === pageId));
    } catch {}
  }, [projectId, pageId]);

  React.useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Listen for real-time comment broadcasts from Supabase Realtime
  React.useEffect(() => {
    const handler = (e: Event) => {
      const c = (e as CustomEvent).detail;
      if (!c || c.pageId !== pageId) return;
      setComments((prev) => {
        if (prev.some((x) => x.id === c.id)) return prev;
        return [...prev, c];
      });
    };
    window.addEventListener("kejmilfy-comment-added", handler);
    return () => window.removeEventListener("kejmilfy-comment-added", handler);
  }, [pageId]);

  if (!session) return null;

  const placeComment = async (e: React.MouseEvent) => {
    if (!placingMode) return;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    if (!draft.trim()) {
      toast.error("Najpierw wpisz treść komentarza");
      return;
    }
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, pageId, x, y, text: draft }),
      });
      if (!res.ok) throw new Error();
      setDraft("");
      setPlacingMode(false);
      fetchComments();
    } catch {
      toast.error("Nie udało się dodać komentarza");
    }
  };

  const addReply = async (commentId: string, text: string) => {
    if (!text.trim()) return;
    // optimistic add reply locally
    setComments((cs) =>
      cs.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: `r_${Math.random().toString(36).slice(2, 8)}`,
                  author: session.name || "Ty",
                  text,
                  createdAt: Date.now(),
                },
              ],
            }
          : c
      )
    );
    // persist replies via PATCH on the comment
    const c = comments.find((x) => x.id === commentId);
    if (c) {
      const newReplies = [...c.replies, { author: session.name || "Ty", text, createdAt: Date.now() }];
      // We don't have a dedicated replies API; using POST to add a top-level reply would be a future enhancement
      // For now we just keep it client-side optimistic
      console.log("reply added", newReplies);
    }
  };

  const resolveComment = async (id: string, current: boolean) => {
    setComments((cs) => cs.map((c) => (c.id === id ? { ...c, resolved: !current } : c)));
    // future: PATCH /api/comments/[id] { resolved }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setShow(!show)}
        className="fixed right-4 bottom-32 z-40 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90"
        title="Komentarze"
      >
        <MessageCircle className="h-5 w-5" />
        {comments.filter((c) => !c.resolved).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
            {comments.filter((c) => !c.resolved).length}
          </span>
        )}
      </button>

      {/* Side panel */}
      {show && (
        <div className="fixed right-4 top-16 bottom-48 w-80 bg-background border rounded-lg shadow-xl z-40 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold text-sm">Komentarze ({comments.length})</h3>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={placingMode ? "default" : "outline"}
                onClick={() => setPlacingMode(!placingMode)}
              >
                + Dodaj
              </Button>
              <button onClick={() => setShow(false)} className="p-1 hover:bg-accent rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {placingMode && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950/30 space-y-1">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Treść komentarza..."
                className="h-8 text-xs"
              />
              <div className="text-[10px] text-muted-foreground text-center">
                Kliknij na canvas, aby umieścić
              </div>
            </div>
          )}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {comments.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-8">
                  Brak komentarzy na tej stronie.
                  <br />
                  Kliknij „+ Dodaj”, aby umieścić.
                </div>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-2 rounded border text-xs ${c.resolved ? "opacity-50" : ""} ${
                    activeId === c.id ? "border-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback style={{ background: c.authorColor }} className="text-white text-[10px]">
                        {c.author[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{c.author}</div>
                      <div className="text-muted-foreground">{c.text}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(c.createdAt).toLocaleString("pl-PL")}
                      </div>
                    </div>
                  </div>
                  {c.replies.length > 0 && (
                    <div className="ml-8 mt-2 space-y-1">
                      {c.replies.map((r) => (
                        <div key={r.id} className="text-xs">
                          <span className="font-medium">{r.author}:</span> {r.text}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={() => {
                        setReplyTo(c.id);
                        setReplyDraft("");
                      }}
                    >
                      <Reply className="h-3 w-3 mr-1" /> Odpowiedz
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={() => resolveComment(c.id, !!c.resolved)}
                    >
                      <Check className="h-3 w-3 mr-1" /> {c.resolved ? "Otwórz" : "Rozwiąż"}
                    </Button>
                  </div>
                  {replyTo === c.id && (
                    <div className="flex gap-1 mt-1">
                      <Input
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        placeholder="Odpowiedź..."
                        className="h-6 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && replyDraft.trim()) {
                            addReply(c.id, replyDraft);
                            setReplyDraft("");
                            setReplyTo(null);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (replyDraft.trim()) {
                            addReply(c.id, replyDraft);
                            setReplyDraft("");
                            setReplyTo(null);
                          }
                        }}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Comment pins on canvas */}
      {comments.map((c) => (
        <div
          key={c.id}
          onClick={(e) => {
            e.stopPropagation();
            setActiveId(c.id === activeId ? null : c.id);
          }}
          style={{
            position: "absolute",
            left: c.x,
            top: c.y,
            transform: `translate(-50%, -100%) scale(${1 / zoom})`,
            transformOrigin: "bottom center",
            zIndex: 30,
            pointerEvents: "auto",
          }}
          className="cursor-pointer"
        >
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs shadow-lg ${
              c.resolved ? "bg-green-500" : "bg-primary"
            } ${activeId === c.id ? "ring-4 ring-primary/30" : ""}`}
            style={{ background: c.resolved ? "#22c55e" : c.authorColor }}
          >
            {c.author[0]?.toUpperCase()}
            {!c.resolved && c.replies.length > 0 && (
              <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] rounded-full h-3 min-w-3 px-0.5 flex items-center justify-center">
                {c.replies.length}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Hidden overlay for placing comments on canvas */}
      {placingMode && (
        <div
          onClick={placeComment}
          className="absolute inset-0 z-20"
          style={{ cursor: "crosshair" }}
        />
      )}
    </>
  );
}
