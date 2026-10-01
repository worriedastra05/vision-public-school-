"use client";

import { useState } from "react";
import { Camera, UserRound } from "lucide-react";

/**
 * Photo picker — file ko base64 data URL me convert karke hidden input me rakhta hai.
 * (Phase 3: base64 in DB. Baad ke phase me Supabase Storage par move hoga.)
 * Max 350KB.
 */
export function PhotoPicker({ defaultPhoto }: { defaultPhoto?: string | null }) {
  const [preview, setPreview] = useState<string | null>(defaultPhoto ?? null);
  const [error, setError] = useState("");

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Sirf image file (JPG/PNG) chalegi");
      return;
    }
    if (file.size > 350 * 1024) {
      setError("Photo 350KB se chhoti honi chahiye");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-4">
      <input type="hidden" name="photo" value={preview ?? ""} />
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Student" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-8 w-8 text-slate-300" />
        )}
      </div>
      <div className="space-y-1.5">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">
          <Camera className="h-4 w-4" />
          {preview ? "Change Photo" : "Upload Photo"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
        <p className="text-[11px] text-slate-400">JPG/PNG, max 350KB. Passport size best rahega.</p>
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}
