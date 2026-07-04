"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    const clean = code.trim();
    const { error } = useBackup
      ? await authClient.twoFactor.verifyBackupCode({ code: clean })
      : await authClient.twoFactor.verifyTotp({ code: clean });
    setPending(false);
    if (error) {
      toast.error(useBackup ? "Invalid backup code." : "Invalid authentication code.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-3xl font-semibold tracking-tight text-primary">HustleOS</div>
        <p className="text-sm text-muted-foreground">Enter your two-factor code.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{useBackup ? "Backup code" : "Authentication code"}</Label>
            <Input
              id="code"
              inputMode={useBackup ? "text" : "numeric"}
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && code.trim() && submit()}
            />
          </div>
          <Button className="w-full" onClick={submit} disabled={pending || !code.trim()}>
            {pending ? "Verifying…" : "Verify"}
          </Button>
          <button
            type="button"
            className="text-xs text-muted-foreground underline w-full text-center"
            onClick={() => setUseBackup((v) => !v)}
          >
            {useBackup ? "Use authenticator code instead" : "Use a backup code instead"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
