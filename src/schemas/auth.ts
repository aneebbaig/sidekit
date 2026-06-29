import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const setupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.email("Enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    error: "New password must differ from current.",
    path: ["newPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SetupInput = z.infer<typeof setupSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
