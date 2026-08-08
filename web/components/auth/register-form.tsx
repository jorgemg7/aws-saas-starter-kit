"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  registerSchema,
  RegisterSchema,
} from "@/lib/validation";

import { registerUser } from "@/features/auth/api";

export function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });


  async function onSubmit(data: RegisterSchema) {
    try {
      setLoading(true);

      await registerUser(
        data.email,
        data.password
      );

      toast.success(
        "Cuenta creada. Revisa tu email para confirmar la cuenta."
      );

      router.push(
        `/confirm?email=${encodeURIComponent(data.email)}`
      );

    } catch (error: any) {

      console.error(error);

      toast.error(
        error?.message ??
        "No se pudo crear la cuenta"
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <Card className="w-full max-w-md p-8">

      <h1 className="text-3xl font-bold">
        Create account
      </h1>

      <p className="mt-2 text-muted-foreground">
        Create your AWS SaaS account.
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
            Password
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
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >

              {showPassword ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}

            </button>

          </div>


          {errors.password && (
            <p className="text-sm text-red-500">
              {errors.password.message}
            </p>
          )}

        </div>


        <div className="space-y-2">

          <Label htmlFor="confirmPassword">
            Confirm password
          </Label>


          <div className="relative">

            <Input
              id="confirmPassword"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="********"
              {...register("confirmPassword")}
            />


            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >

              {showConfirmPassword ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}

            </button>

          </div>


          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}

        </div>


        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >

          {loading
            ? "Creating account..."
            : "Create account"
          }

        </Button>


      </form>

    </Card>
  );
}
