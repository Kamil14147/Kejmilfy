export const runtime = "edge";

import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth-edge";

export async function GET(req: Request) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarColor: user.avatarColor,
    },
  });
}
