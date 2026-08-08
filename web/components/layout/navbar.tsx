import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-lg font-semibold">
        AWS SaaS Starter
      </Link>

      <nav className="flex items-center gap-6">
        <Link href="/pricing">Pricing</Link>
        <Link href="/docs">Docs</Link>

        <Link
          href="/login"
          className={buttonVariants({
            variant: "ghost",
          })}
        >
          Login
        </Link>

        <Link
          href="/register"
          className={buttonVariants({
            variant: "default",
          })}
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}
