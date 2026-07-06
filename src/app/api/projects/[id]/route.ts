export const runtime = "edge";

import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth-edge";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Project } from "@/lib/canvas/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
  const { id } = await params;
  const { data, error } = await supabase
    .from("projects")
    .select("data, author_id")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("Get error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  if (!data || data.author_id !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ project: JSON.parse(data.data) as Project });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
  const { id } = await params;
  const { data: existing } = await supabase
    .from("projects")
    .select("id, author_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing || existing.author_id !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json();
  const update: any = { updated_at: new Date().toISOString() };
  if (typeof body.name === "string") update.name = body.name;
  if (typeof body.favorite === "boolean") update.favorite = body.favorite;
  if (typeof body.deleted === "boolean") update.deleted = body.deleted;
  if (typeof body.thumbnail === "string") update.thumbnail = body.thumbnail;
  if (body.project) update.data = JSON.stringify(body.project);

  const { error } = await supabase.from("projects").update(update).eq("id", id);
  if (error) {
    console.error("Patch error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
  const { id } = await params;
  const { data: existing } = await supabase
    .from("projects")
    .select("id, author_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing || existing.author_id !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    console.error("Delete error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
