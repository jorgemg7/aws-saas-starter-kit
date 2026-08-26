"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { loginUser } from "@/features/auth/api";
import { getErrorMessage } from "@/types/api";

import {
  loginSchema,
  LoginSchema,
} from "@/lib/validation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginSchema) {
    try {
      setLoading(true);

      await loginUser(
        data.email,
        data.password,
      );

      toast.success(
        "Inicio de sesión correcto",
      );

      router.push("/dashboard");
    } catch (error: unknown) {
      console.error(error);

      toast.error(
        getErrorMessage(
          error,
          "No se pudo iniciar sesión",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-8">
      <h1 className="text-3xl font-bold">
        Iniciar sesión
      </h1>

      <p className="mt-2 text-muted-foreground">
        Accede a tu cuenta.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="email">
            Email
          </Label>

          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            {...register("email")}
          />

          {errors.email && (
            <p className="text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Contraseña
          </Label>

          <div className="relative">
            <Input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="********"
              {...register("password")}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          className="w-full"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Iniciando sesión..."
            : "Iniciar sesión"}
        </Button>
      </form>
    </Card>
  );
}
