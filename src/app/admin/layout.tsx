import { ReactNode } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await getSession();

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">ZWriter Admin</h2>
                    <nav className="space-y-2">
                        <Link 
                            href="/admin" 
                            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            Dashboard
                        </Link>
                        <Link 
                            href="/admin/posts" 
                            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            Posts
                        </Link>
                        <Link 
                            href="/admin/editor" 
                            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            Editor
                        </Link>
                    </nav>
                </div>
                <div className="p-4 border-t border-gray-200">
                    {session?.user && (
                        <div className="text-sm text-gray-600 mb-2 truncate">
                            {session.user.email}
                        </div>
                    )}
                    <SignOutButton />
                </div>
            </aside>
            <main className="flex-1 p-6">{children}</main>
        </div>
    )
}