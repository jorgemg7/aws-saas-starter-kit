import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Introduce un email válido"),

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginSchema =
  z.infer<typeof loginSchema>;


export const registerSchema = z.object({
  email: z
    .string()
    .email("Introduce un email válido"),

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),

  confirmPassword: z
    .string()
    .min(8, "Confirma tu contraseña"),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  }
);

export type RegisterSchema =
  z.infer<typeof registerSchema>;
