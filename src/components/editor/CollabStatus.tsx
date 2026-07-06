"use client";

import * as React from "react";
import { useSupabaseAvailable } from "@/lib/supabase";
import { Wifi, WifiOff, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CollabStatus() {
  const ok = useSupabaseAvailable();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border ${
              ok
                ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
            }`}
          >
            {ok ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span className="hidden sm:inline">{ok ? "Live" : "Offline"}</span>
            {ok && <Users className="h-3 w-3" />}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {ok ? (
            <span>Współpraca na żywo aktywna (Supabase Realtime)</span>
          ) : (
            <span>
              Współpraca na żywo wyłączona.
              <br />
              Skonfiguruj Supabase, aby włączyć kursory innych użytkowników.
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
