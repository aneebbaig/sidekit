"use client";

import { useState } from "react";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_PROVIDERS, AI_PROVIDER_LABELS, aiSettingsSchema, type AiSettingsInput } from "@/schemas/ai";
import { updateAiSettingsAction, testAiConnectionAction } from "@/actions/ai-actions";

interface Props {
  provider: (typeof AI_PROVIDERS)[number] | null;
  model: string | null;
  baseUrl: string | null;
  hasKey: boolean;
}

export function AiSettingsCard({ provider, model, baseUrl, hasKey }: Props) {
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [revealKey, setRevealKey] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      provider: provider ?? "OPENAI",
      apiKey: "",
      model: model ?? "",
      baseUrl: baseUrl ?? "",
    },
  });

  const selectedProvider = watch("provider");

  async function onSave(values: AiSettingsInput) {
    setSaving(true);
    const res = await updateAiSettingsAction(values);
    setSaving(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("AI settings saved.");
    setValue("apiKey", "");
  }

  async function handleTest() {
    setTesting(true);
    const res = await testAiConnectionAction(getValues());
    setTesting(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Connection works.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </CardTitle>
        <CardDescription>
          Bring your own API key to enable AI-assisted data entry across cost sheets, inventory,
          suppliers, and hustle generation. Your key is encrypted at rest and only ever sent to the
          provider you choose below - never to a shared server.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSave)} noValidate>
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              value={selectedProvider}
              onValueChange={(v) => setValue("provider", v as AiSettingsInput["provider"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {AI_PROVIDER_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>API key</Label>
            <div className="flex items-center gap-2">
              <Input
                type={revealKey ? "text" : "password"}
                placeholder={hasKey ? "Key is set - leave blank to keep it" : "Paste your API key"}
                {...register("apiKey")}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setRevealKey((r) => !r)}
                title={revealKey ? "Hide" : "Show"}
              >
                {revealKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.apiKey ? <p className="text-xs text-destructive">{errors.apiKey.message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Model (optional)</Label>
              <Input placeholder="Provider default" {...register("model")} />
            </div>
            {selectedProvider === "OPENAI_COMPATIBLE" ? (
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input placeholder="https://api.example.com/v1" {...register("baseUrl")} />
                {errors.baseUrl ? (
                  <p className="text-xs text-destructive">{errors.baseUrl.message}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={testing} onClick={handleTest}>
              {testing ? "Testing..." : "Test connection"}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
