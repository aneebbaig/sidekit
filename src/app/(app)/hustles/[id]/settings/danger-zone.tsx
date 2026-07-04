"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteHustleAction } from "@/actions/hustle-actions";

interface Props {
  hustleId: string;
  hustleName: string;
}

export function DangerZone({ hustleId, hustleName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  async function handleDelete() {
    setPending(true);
    const res = await deleteHustleAction(hustleId, confirmation);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Hustle deleted.");
    router.push("/hustles");
    router.refresh();
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader className="flex flex-row items-center gap-2">
        <TriangleAlert className="h-4 w-4 text-destructive" />
        <CardTitle>Danger zone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Permanently delete this hustle and all its data: research notes, cost items, suppliers,
          inventory, orders, customers, transactions, and tasks. This cannot be undone.
        </p>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setConfirmation("");
          }}
        >
          <DialogTrigger asChild>
            <Button variant="destructive">Delete hustle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete “{hustleName}”?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Type <span className="font-semibold text-foreground">{hustleName}</span> below to confirm.
              </p>
              <div className="space-y-2">
                <Label>Confirm hustle name</Label>
                <Input
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder={hustleName}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={pending || confirmation !== hustleName}
                  onClick={handleDelete}
                >
                  {pending ? "Deleting..." : "Permanently delete"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
