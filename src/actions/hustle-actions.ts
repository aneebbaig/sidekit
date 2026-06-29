"use server";

import crypto from "crypto";
import type { HustleStatus } from "@/generated/prisma/client";
import { hustleService } from "@/services/hustle-service";
import { hustleRepository } from "@/repositories/hustle-repository";
import { withAuth, revalidateHustle, revalidateGlobal } from "./_helpers";
import { ok } from "@/lib/result";
import type { HustleInput } from "@/schemas/hustle";

export async function createHustleAction(input: HustleInput) {
  return withAuth(async () => {
    const res = await hustleService.create(input);
    if (res.success) revalidateGlobal();
    return res;
  });
}

export async function updateHustleAction(id: string, input: HustleInput) {
  return withAuth(async () => {
    const res = await hustleService.update(id, input);
    if (res.success) { revalidateGlobal(); revalidateHustle(id); }
    return res;
  });
}

export async function updateHustleStatusAction(id: string, status: HustleStatus) {
  return withAuth(async () => {
    const res = await hustleService.updateStatus(id, status);
    if (res.success) { revalidateGlobal(); revalidateHustle(id); }
    return res;
  });
}

export async function deleteHustleAction(id: string, confirmation: string) {
  return withAuth(async () => {
    const res = await hustleService.delete(id, confirmation);
    if (res.success) revalidateGlobal();
    return res;
  });
}

export async function generateApiKeyAction(hustleId: string) {
  return withAuth(async () => {
    const key = `hsk_${crypto.randomBytes(24).toString("hex")}`;
    await hustleRepository.setApiKey(hustleId, key);
    revalidateHustle(hustleId, "settings");
    return ok({ key });
  });
}
