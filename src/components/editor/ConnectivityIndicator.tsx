"use client";

import * as React from "react";
import { Wifi, WifiOff, Cloud, CloudOff } from "lucide-react";
import { useEditor } from "@/lib/canvas/store";

export function ConnectivityIndicator() {
  const [online, setOnline] = React.useState(true);
  const isDirty = useEditor((s) => s.isDirty);
  const lastSavedAt = useEditor((s) => s.lastSavedAt);

  React.useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
      {online ? (
        <Wifi className="h-3 w-3 text-green-500" />
      ) : (
        <WifiOff className="h-3 w-3 text-amber-500" />
      )}
      <span className="hidden sm:inline">
        {online
          ? isDirty
            ? "Zapisywanie..."
            : lastSavedAt
              ? "Zapisano"
              : "Online"
          : "Offline — zapis lokalny"}
      </span>
    </div>
  );
}
