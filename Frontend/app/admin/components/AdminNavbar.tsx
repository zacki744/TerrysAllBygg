"use client";

import { useRouter } from "next/navigation";
import { AuthService } from "@/app/lib/auth";
import Button from "@/app/components/ui/Button";

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await AuthService.logout();
    router.push("/admin/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-background/90 backdrop-blur-md z-50 shadow-md py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-semibold">BuildCo Admin</h1>
        <div className="flex gap-6 text-sm font-medium">
          <a href="/admin.html" className="hover:text-accent transition-colors">
            Projects
          </a>
          <a href="/" className="hover:text-accent transition-colors">
            View Site
          </a>
        </div>
      </div>

      <Button onClick={handleLogout} className="text-sm px-4 py-2">
        Logout
      </Button>
    </nav>
  );
}