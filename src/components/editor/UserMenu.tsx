"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession, logout } from "@/lib/use-session";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function UserMenu() {
  const { user: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => router.push("/auth")}
      >
        Zaloguj
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-accent">
          <Avatar className="h-7 w-7">
            <AvatarFallback
              style={{ background: session.avatarColor || "#6366f1" }}
              className="text-white text-xs"
            >
              {(session.name || session.email)[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm hidden sm:inline">{session.name}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Konto</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback
                style={{ background: session.avatarColor || "#6366f1" }}
                className="text-white"
              >
                {(session.name || session.email)[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{session.name}</div>
              <div className="text-xs text-muted-foreground">{session.email}</div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push("/dashboard")}
          >
            <UserIcon className="h-4 w-4 mr-2" /> Moje projekty
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => toast.info("Ustawienia konta — wkrótce")}
          >
            <Settings className="h-4 w-4 mr-2" /> Ustawienia
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={async () => {
              await logout();
              toast.success("Wylogowano");
              window.location.href = "/";
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Wyloguj
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
