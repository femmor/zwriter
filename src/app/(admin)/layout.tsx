import { ReactNode } from "react";

export default function AdminLayout({ children }: { children:ReactNode }) {
    return (
        <div className="flex">
            <aside className="w-64 p-4 border-r border-gray-300">CMS Admin Sidebar</aside>
            <main className="flex-1 p-6">{children}</main>
        </div>
    )
}