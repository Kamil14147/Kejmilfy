export const runtime = "edge";

import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth-edge";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ comments: [] });
  }
  const { data, error } = await supabase
    .from("comments")
    .select(`
      id,
      project_id,
      page_id,
      x,
      y,
      text,
      resolved,
      replies,
      created_at,
      author:users!comments_author_id_fkey ( name, email, avatar_color )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Comments list error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  const comments = (data || []).map((c: any) => ({
    id: c.id,
    pageId: c.page_id,
    x: c.x,
    y: c.y,
    text: c.text,
    resolved: c.resolved,
    replies: typeof c.replies === "string" ? JSON.parse(c.replies) : [],
    author: c.author?.name || c.author?.email || "Anonim",
    authorColor: c.author?.avatar_color || "#6366f1",
    createdAt: new Date(c.created_at).getTime(),
  }));
  return NextResponse.json({ comments });
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
  const body = await req.json();
  const { projectId, pageId, x, y, text } = body;
  if (!projectId || !pageId || text == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const id = `cm_${Math.random().toString(36).slice(2, 12)}`;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      id,
      project_id: projectId,
      page_id: pageId,
      x,
      y,
      text,
      resolved: false,
      replies: "[]",
      author_id: session.id,
      created_at: now,
      updated_at: now,
    })
    .select(`
      id, project_id, page_id, x, y, text, resolved, replies, created_at,
      author:users!comments_author_id_fkey ( name, email, avatar_color )
    `)
    .single();
  if (error) {
    console.error("Comment insert error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  await supabase.from("activities").insert({
    id: `a_${Math.random().toString(36).slice(2, 12)}`,
    project_id: projectId,
    type: "comment",
    action: "dodał komentarz",
    author_id: session.id,
    created_at: now,
  });
  return NextResponse.json({
    comment: {
      id: data.id,
      pageId: data.page_id,
      x: data.x,
      y: data.y,
      text: data.text,
      resolved: false,
      replies: [],
      author: data.author?.name || data.author?.email || "Anonim",
      authorColor: data.author?.avatar_color || "#6366f1",
      createdAt: new Date(data.created_at).getTime(),
    },
  });
}
