"use client";

import { useState } from "react";
import { Camera, UserRound, X } from "lucide-react";

/**
 * Photo picker — converts the file to a base64 data URL and stores it in a
 * hidden form input named "photo" (saved to the students.photo column).
 * Max size: 350KB.
 */
export function PhotoPicker({ defaultPhoto }: { defaultPhoto?: string | null }) {
  const [preview, setPreview] = useState<string | null>(defaultPhoto ?? null);
  const [error, setError] = useState("");

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files (JPG/PNG) are allowed");
      return;
    }
    if (file.size > 350 * 1024) {
      setError("Photo must be smaller than 350KB");
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
      <div className="relative h-20 w-20 shrink-0">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Student" className="h-full w-full object-cover" />
          ) : (
            <UserRound className="h-8 w-8 text-slate-300" />
          )}
        </div>
        {preview && (
          <button
            type="button"
            aria-label="Remove photo"
            title="Remove photo"
            onClick={() => {
              setPreview(null);
              setError("");
            }}
            className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-[0.98]">
          <Camera className="h-4 w-4" />
          {preview ? "Change Photo" : "Upload Photo"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
        <p className="text-[11px] text-slate-400">JPG/PNG, up to 350KB. A passport-size photo works best.</p>
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}
