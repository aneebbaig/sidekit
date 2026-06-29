"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/auth";
import { changePasswordAction, logoutAction } from "@/actions/auth-actions";

export function ChangePasswordForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: ChangePasswordInput) {
    setPending(true);
    const res = await changePasswordAction(values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Password updated. Sign in again with the new password.");
    reset();
    await logoutAction();
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
        />
        {errors.currentPassword ? (
          <p className="text-xs text-rose-300">{errors.currentPassword.message}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
          />
          {errors.newPassword ? (
            <p className="text-xs text-rose-300">{errors.newPassword.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="text-xs text-rose-300">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        You&apos;ll be signed out after a successful change and asked to sign in with the new password.
      </p>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Updating..." : "Change password"}
        </Button>
      </div>
    </form>
  );
}
