"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";

import { confirmUser } from "@/features/auth/api";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirm(event: React.FormEvent) {
    event.preventDefault();

    if (!email) {
      toast.error("No se encontró el email");
      return;
    }

    try {
      setLoading(true);

      await confirmUser(email, code);

      toast.success("Cuenta confirmada correctamente");

      router.push("/login");
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.message ?? "Código incorrecto"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold">
          Confirm account
        </h1>

        <p className="mt-2 text-muted-foreground">
          Hemos enviado un código de verificación a:
        </p>

        <p className="mt-2 font-medium">
          {email}
        </p>

        <form
          onSubmit={handleConfirm}
          className="mt-8 space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="code">
              Verification code
            </Label>

            <Input
              id="code"
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
              placeholder="123456"
            />
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Confirming..."
              : "Confirm account"}
          </Button>
        </form>
      </Card>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-6">
          <p>Cargando...</p>
        </main>
      }
    >
      <ConfirmForm />
    </Suspense>
  );
}
