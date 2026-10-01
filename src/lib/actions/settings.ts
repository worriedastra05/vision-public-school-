"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { requireRole, logActivity } from "@/lib/guards";
import { SETTING_KEYS } from "@/lib/settings-keys";

const field = z.string().trim().max(200).default("");

/** Save school settings — ID cards and receipts update automatically */
export async function saveSettings(formData: FormData) {
  const session = await requireRole("SUPERADMIN");

  const schoolName = field.parse(formData.get("school_name") ?? "");
  if (schoolName.length < 3) {
    redirect("/superadmin/settings?err=" + encodeURIComponent("School name is required (min 3 letters)"));
  }

  for (const [key] of SETTING_KEYS) {
    const value = field.parse(formData.get(key) ?? "");
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }

  await logActivity(session.user.id, "settings.update", `School settings updated (${SETTING_KEYS.length} fields)`);
  redirect("/superadmin/settings?ok=" + encodeURIComponent("Settings saved — live across the portal"));
}
