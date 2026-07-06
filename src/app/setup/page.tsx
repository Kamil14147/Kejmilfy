"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Database, Check, Copy, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleField } from "@/components/ParticleField";
import { toast } from "sonner";

const SQL = `-- kejmilfy — Supabase schema
-- Run in: Supabase Dashboard → SQL Editor → New query → Run

create table if not exists users (
  id            text primary key,
  email         text unique not null,
  name          text,
  password_hash text not null,
  avatar_color  text not null default '#6366f1',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists folders (
  id         text primary key,
  name       text not null,
  color      text not null default '#6366f1',
  user_id    text not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id          text primary key,
  name        text not null,
  data        text not null,
  thumbnail   text,
  favorite    boolean not null default false,
  deleted     boolean not null default false,
  folder_id   text references folders(id) on delete set null,
  author_id   text not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists comments (
  id          text primary key,
  project_id  text not null references projects(id) on delete cascade,
  page_id     text not null,
  x           double precision not null,
  y           double precision not null,
  text        text not null,
  resolved    boolean not null default false,
  replies     text not null default '[]',
  author_id   text not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists activities (
  id          text primary key,
  project_id  text not null references projects(id) on delete cascade,
  type        text not null,
  action      text not null,
  author_id   text not null references users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists projects_author_id_idx on projects(author_id);
create index if not exists projects_updated_at_idx on projects(updated_at desc);
create index if not exists comments_project_id_idx on comments(project_id);
create index if not exists activities_project_id_idx on activities(project_id);

-- RLS (optional — secret key bypasses it server-side)
alter table users      enable row level security;
alter table folders    enable row level security;
alter table projects   enable row level security;
alter table comments   enable row level security;
alter table activities enable row level security;

create policy "read users"      on users for select using (true);
create policy "insert users"    on users for insert with check (true);
create policy "update users"    on users for update using (true);
create policy "read projects"   on projects for select using (true);
create policy "insert projects" on projects for insert with check (true);
create policy "update projects" on projects for update using (true);
create policy "delete projects" on projects for delete using (true);
create policy "read folders"    on folders for select using (true);
create policy "insert folders"  on folders for insert with check (true);
create policy "update folders"  on folders for update using (true);
create policy "delete folders"  on folders for delete using (true);
create policy "read comments"   on comments for select using (true);
create policy "insert comments" on comments for insert with check (true);
create policy "update comments" on comments for update using (true);
create policy "delete comments" on comments for delete using (true);
create policy "read activities"   on activities for select using (true);
create policy "insert activities" on activities for insert with check (true);
create policy "delete activities" on activities for delete using (true);

-- Enable Realtime
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table activities;`;

export default function SetupPage() {
  const [copied, setCopied] = React.useState(false);
  const [status, setStatus] = React.useState<"checking" | "ready" | "missing">("checking");

  const check = async () => {
    setStatus("checking");
    try {
      const res = await fetch("/api/setup-check");
      const data = await res.json();
      setStatus(data.ready ? "ready" : "missing");
    } catch {
      setStatus("missing");
    }
  };

  React.useEffect(() => {
    check();
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(SQL);
    setCopied(true);
    toast.success("SQL skopiowany");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white relative overflow-hidden">
      <ParticleField count={30} colors={["#6366f1", "#8b5cf6", "#ec4899"]} />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 container mx-auto px-6 py-12 max-w-4xl"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 text-sm">
          ← Wróć na stronę główną
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Database className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold">Setup bazy danych Supabase</h1>
        </div>
        <p className="text-white/60 mb-8">
          Klucze Supabase są już skonfigurowane w <code className="px-1.5 py-0.5 rounded bg-white/10 text-xs">.env</code>.
          Pozostał jeden krok: utwórz tabele w bazie.
        </p>

        {/* Status */}
        <div className={`rounded-2xl border p-4 mb-6 flex items-center gap-3 ${
          status === "ready"
            ? "bg-green-500/10 border-green-500/30"
            : status === "missing"
              ? "bg-amber-500/10 border-amber-500/30"
              : "bg-white/5 border-white/10"
        }`}>
          {status === "ready" ? (
            <>
              <Check className="h-5 w-5 text-green-400" />
              <div className="flex-1">
                <div className="font-semibold text-green-400">Baza gotowa!</div>
                <div className="text-xs text-white/60">Wszystkie tabele istnieją w Supabase.</div>
              </div>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0">
                  Przejdź do logowania <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </>
          ) : status === "missing" ? (
            <>
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <div className="flex-1">
                <div className="font-semibold text-amber-400">Tabele nie istnieją</div>
                <div className="text-xs text-white/60">Uruchom poniższy SQL w Supabase SQL Editor.</div>
              </div>
              <Button variant="outline" onClick={check} className="border-white/20">
                Sprawdź ponownie
              </Button>
            </>
          ) : (
            <div className="flex-1 text-sm">Sprawdzanie połączenia z Supabase…</div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          <Step n={1} title="Otwórz Supabase SQL Editor">
            W dashboardzie Supabase przejdź do <code className="px-1.5 py-0.5 rounded bg-white/10 text-xs">SQL Editor → New query</code>.
          </Step>
          <Step n={2} title="Wklej SQL poniżej i uruchom">
            Skopiuj poniższy kod, wklej w SQL Editor i kliknij <code className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Run</code>.
          </Step>
          <Step n={3} title='Wróć tutaj i kliknij „Sprawdź ponownie"'>
            Status zmieni się na zielony — wtedy możesz się zalogować.
          </Step>
        </div>

        {/* SQL */}
        <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
            <span className="text-xs font-mono text-white/60">supabase-schema.sql</span>
            <Button size="sm" variant="ghost" onClick={copy} className="text-white hover:bg-white/10">
              {copied ? <Check className="h-3 w-3 mr-1 text-green-400" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied ? "Skopiowano" : "Kopiuj"}
            </Button>
          </div>
          <pre className="p-4 text-xs overflow-x-auto max-h-96 text-white/80 font-mono leading-relaxed">
            {SQL}
          </pre>
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={check} className="border-white/20">
            Sprawdź ponownie status
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
        {n}
      </div>
      <div>
        <div className="font-semibold mb-1">{title}</div>
        <div className="text-sm text-white/60">{children}</div>
      </div>
    </div>
  );
}
