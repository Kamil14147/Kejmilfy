"use client";

import * as React from "react";
import { useSession, login, register, logout } from "@/lib/use-session";
import { useEditor } from "@/lib/canvas/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Copy, Eye, MessageSquare, Pencil, Check, QrCode } from "lucide-react";
import { toast } from "sonner";

interface Props {
  children?: React.ReactNode;
}

export function ShareDialog({ children }: Props) {
  const project = useEditor((s) => s.project);
  const { user: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState("");
  const [permission, setPermission] = React.useState<"view" | "comment" | "edit">("view");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (open && project) {
      const url = `${window.location.origin}/shared/${project.id}?perm=${permission}`;
      setShareUrl(url);
    }
  }, [open, project, permission]);

  if (!project) return null;

  const copy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link skopiowany");
    setTimeout(() => setCopied(false), 2000);
  };

  // QR code via api.qrserver.com — public, no auth
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" /> Udostępnij
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Udostępnij projekt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Poziom dostępu</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <PermBtn active={permission === "view"} onClick={() => setPermission("view")} icon={<Eye className="h-4 w-4" />} label="Podgląd" />
              <PermBtn active={permission === "comment"} onClick={() => setPermission("comment")} icon={<MessageSquare className="h-4 w-4" />} label="Komentarze" />
              <PermBtn active={permission === "edit"} onClick={() => setPermission("edit")} icon={<Pencil className="h-4 w-4" />} label="Edycja" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Link do udostępnienia</Label>
            <div className="flex gap-2 mt-1">
              <Input value={shareUrl} readOnly className="text-xs" />
              <Button size="sm" onClick={copy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs">Kod QR</Label>
            <div className="flex justify-center p-4 bg-white border rounded-lg mt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR" className="w-48 h-48" />
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Zeskanuj, aby otworzyć projekt na telefonie
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PermBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors ${
        active ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
