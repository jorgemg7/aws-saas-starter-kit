"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { logoutUser } from "@/features/auth/api";

export function DashboardNavbar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutUser();

      toast.success("Sesión cerrada correctamente");

      router.push("/login");
    } catch (error) {
      console.error(error);

      toast.error("No se pudo cerrar la sesión");
    }
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold"
        >
          AWS SaaS Starter
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hover:text-primary"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/profile"
            className="hover:text-primary"
          >
            Perfil
          </Link>

          <Link
            href="/dashboard/settings"
            className="hover:text-primary"
          >
            Ajustes
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </nav>
      </div>
    </header>
  );
}
