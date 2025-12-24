import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createContext() {
  const session = await getServerSession(authOptions);

  return {
    user: session?.user,
    role: session?.user?.role,
  };
}