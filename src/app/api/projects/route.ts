export const runtime = "edge";

import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth-edge";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Project } from "@/lib/canvas/types";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, thumbnail, favorite, created_at, updated_at")
    .eq("author_id", session.id)
    .eq("deleted", false)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("List error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({
    projects: (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      thumbnail: p.thumbnail,
      favorite: p.favorite,
      createdAt: new Date(p.created_at).getTime(),
      updatedAt: new Date(p.updated_at).getTime(),
    })),
  });
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
  try {
    const body = await req.json();
    const project: Project = body.project;
    if (!project?.id || !project?.pages) {
      return NextResponse.json({ error: "Invalid project" }, { status: 400 });
    }
    const data = JSON.stringify(project);
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from("projects")
      .select("id, author_id")
      .eq("id", project.id)
      .maybeSingle();
    if (existing && existing.author_id !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing) {
      const { error } = await supabase
        .from("projects")
        .update({
          name: project.name,
          data,
          thumbnail: project.thumbnail || null,
          favorite: project.favorite || false,
          updated_at: now,
        })
        .eq("id", project.id);
      if (error) {
        console.error("Update error", error);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    const { error } = await supabase.from("projects").insert({
      id: project.id,
      name: project.name,
      data,
      thumbnail: project.thumbnail || null,
      favorite: project.favorite || false,
      deleted: false,
      author_id: session.id,
      created_at: now,
      updated_at: now,
    });
    if (error) {
      console.error("Insert error", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Save error", e);
    return NextResponse.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 });
  }
}
