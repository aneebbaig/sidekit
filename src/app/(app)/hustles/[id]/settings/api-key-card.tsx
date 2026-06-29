"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Copy, RefreshCw, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { generateApiKeyAction } from "@/actions/hustle-actions";

interface ApiKeyCardProps {
  hustleId: string;
  apiKey: string | null;
}

function maskKey(key: string): string {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}${"•".repeat(24)}${key.slice(-4)}`;
}

export function ApiKeyCard({ hustleId, apiKey: initialKey }: ApiKeyCardProps) {
  const [key, setKey] = useState(initialKey);
  const [revealed, setRevealed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const res = await generateApiKeyAction(hustleId);
      if (res.success) {
        setKey(res.data.key);
        setRevealed(true);
        toast.success("API key generated.");
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleCopy() {
    if (!key) return;
    navigator.clipboard.writeText(key);
    toast.success("Copied to clipboard.");
  }

  const displayKey = key ? (revealed ? key : maskKey(key)) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          API Key
        </CardTitle>
        <CardDescription>
          Use this key in your external website to send orders to this hustle via{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">POST /api/public/orders</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {key ? (
          <>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm break-all">
                {displayKey}
              </code>
              <Button variant="outline" size="icon" onClick={() => setRevealed((r) => !r)} title={revealed ? "Hide" : "Reveal"}>
                {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleCopy} title="Copy">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isPending}>
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  Regenerate
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Regenerate API key?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The current key will stop working immediately. Any external website using it will need to be updated.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleGenerate}>Regenerate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Button onClick={handleGenerate} disabled={isPending}>
            <Key className="h-4 w-4 mr-2" />
            {isPending ? "Generating…" : "Generate API Key"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
