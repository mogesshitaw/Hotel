import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "app_session_user";

export async function getCurrentUserId(): Promise<string> {
  const cookieStore = cookies();
  const sessionUser = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionUser) {
    return sessionUser;
  }

  // Fallback to dev user ID if no cookie is set yet
  const devId = process.env.DEV_USER_ID;
  if (devId) return devId;

  throw new Error("Unauthenticated");
}

export async function getCurrentUser() {
  try {
    const userId = await getCurrentUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            restaurant: true,
          },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
}
