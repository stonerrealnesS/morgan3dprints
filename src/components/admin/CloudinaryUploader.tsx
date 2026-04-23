"use client";

import { useRef, useState } from "react";

type Props = {
  currentImageUrl?: string;
  name?: string;
};

export function CloudinaryUploader({ currentImageUrl, name = "imageUrl" }: Props) {
  const [preview, setPreview] = useState<string>(currentImageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Get server-signed credentials
      const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
      if (!signRes.ok) throw new Error("Failed to get upload credentials.");
      const { signature, timestamp, apiKey, cloudName } = await signRes.json();

      // Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!uploadRes.ok) throw new Error("Cloudinary upload failed.");
      const data = await uploadRes.json();

      setPreview(data.secure_url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" style={{ color: "#8888aa" }}>
        Product Image
      </label>

      {/* Hidden input carries the URL into the server action form */}
      <input type="hidden" name={name} value={preview} />

      {/* Preview */}
      {preview && (
        <div className="relative w-24 h-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Product"
            className="w-24 h-24 rounded-lg object-cover"
            style={{ border: "1px solid #1e1e30" }}
          />
          <button
            type="button"
            onClick={() => setPreview("")}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
            style={{ background: "#ec4899", color: "#fff" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl cursor-pointer transition-all"
        style={{
          border: `2px dashed ${dragging ? "#a855f7" : "#1e1e30"}`,
          background: dragging ? "rgba(168,85,247,0.06)" : "#13131e",
        }}
      >
        {uploading ? (
          <div className="flex items-center gap-2" style={{ color: "#a855f7" }}>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm">Uploading…</span>
          </div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: "#8888aa" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm" style={{ color: "#8888aa" }}>
              {preview ? "Replace image" : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs" style={{ color: "#555577" }}>PNG, JPG, WEBP — max 10 MB</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-sm" style={{ color: "#ec4899" }}>{error}</p>}
    </div>
  );
}
