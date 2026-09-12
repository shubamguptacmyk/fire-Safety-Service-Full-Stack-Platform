import { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Upload,
  Link2,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { catalogService } from "@/services/catalogService";

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  folder?: string;
  aspectRatio?: "banner" | "card" | "square";
  helpText?: string;
  className?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ImageUploadInput({
  value,
  onChange,
  label = "Image",
  required = false,
  folder = "general",
  aspectRatio = "banner",
  helpText,
  className = "",
}: ImageUploadInputProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgLoadError, setImgLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspectRatio === "banner"
      ? "aspect-[21/9] sm:aspect-[16/7]"
      : aspectRatio === "card"
      ? "aspect-[16/9]"
      : "aspect-square max-w-[200px]";

  async function processFile(file: File) {
    setError(null);
    setImgLoadError(false);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file format. Supported types: JPG, PNG, WEBP, and SVG.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit.`);
      return;
    }

    setIsUploading(true);
    try {
      const result = await catalogService.uploadImage(file);
      onChange(result.url);
      setError(null);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Image upload failed. Please check your network or try another file."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleClear() {
    onChange("");
    setError(null);
    setImgLoadError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className={`space-y-2 text-xs ${className}`}>
      {/* Header with Label and Mode Choice Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="font-bold text-ink flex items-center gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {/* Clear Choice Toggle: Image URL | Upload Image */}
        <div className="inline-flex p-0.5 bg-paper rounded-lg border border-black/10">
          <button
            type="button"
            onClick={() => {
              setMode("upload");
              setError(null);
            }}
            className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
              mode === "upload"
                ? "bg-white text-ink shadow-sm border border-black/5"
                : "text-steel hover:text-ink"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Image
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("url");
              setError(null);
            }}
            className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
              mode === "url"
                ? "bg-white text-ink shadow-sm border border-black/5"
                : "text-steel hover:text-ink"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Image URL
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Mode UI */}
      {mode === "upload" && (
        <div className="space-y-2">
          {!value ? (
            /* Empty State / Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? "border-brand bg-brand/5 scale-[1.01]"
                  : "border-black/15 bg-paper/30 hover:bg-paper/70 hover:border-brand/40"
              } ${isUploading ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {isUploading ? (
                <div className="py-3 flex flex-col items-center gap-2 text-brand">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="font-semibold text-xs text-ink">Uploading to Cloudinary...</span>
                  <span className="text-[11px] text-steel">Processing high-resolution asset</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-steel group-hover:text-brand border border-black/5 shadow-xs">
                    <Upload className="w-5 h-5 text-brand" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-ink text-xs">
                      <span className="text-brand hover:underline">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[11px] text-steel">
                      JPG, PNG, WEBP, or SVG · Max file size 10MB
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Uploaded Preview Card */
            <div className="border border-black/10 rounded-xl overflow-hidden bg-paper/40 space-y-2 p-2.5">
              <div
                className={`relative w-full ${aspectClass} rounded-lg overflow-hidden bg-white border border-black/10 shadow-inner flex items-center justify-center group`}
              >
                {imgLoadError ? (
                  <div className="p-4 text-center text-steel flex flex-col items-center gap-1">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                    <span className="text-xs">Failed to render image preview</span>
                  </div>
                ) : (
                  <img
                    src={value}
                    alt="Asset preview"
                    onError={() => setImgLoadError(true)}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Top overlay badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Active Image
                  </span>
                  {value.includes("cloudinary") && (
                    <span className="px-2 py-0.5 rounded-md bg-brand/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                      Cloudinary CDN
                    </span>
                  )}
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md bg-black/60 text-white hover:bg-black transition-colors"
                    title="Open full image in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2 max-w-[65%] truncate">
                  <span className="text-steel truncate font-mono text-[11px]">{value}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-white hover:bg-paper border border-black/10 rounded font-semibold text-ink flex items-center gap-1 transition-colors"
                  >
                    {isUploading ? (
                      <Loader2 className="w-3 h-3 animate-spin text-brand" />
                    ) : (
                      <RefreshCw className="w-3 h-3 text-steel" />
                    )}
                    {isUploading ? "Uploading..." : "Replace Image"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-steel hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Mode UI */}
      {mode === "url" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                required={required && !value}
                placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  setImgLoadError(false);
                  setError(null);
                }}
                className="w-full p-2 pr-8 bg-paper/50 border border-black/10 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand font-mono"
              />
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-steel hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* URL Live Preview */}
          {value && (
            <div className="border border-black/10 rounded-xl overflow-hidden bg-paper/40 p-2 space-y-1.5">
              <div
                className={`relative w-full ${aspectClass} rounded-lg overflow-hidden bg-white border border-black/10 shadow-inner flex items-center justify-center`}
              >
                {imgLoadError ? (
                  <div className="p-4 text-center text-steel flex flex-col items-center gap-1">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-[11px]">
                      Unable to load image from this URL. Please check the address.
                    </span>
                  </div>
                ) : (
                  <img
                    src={value}
                    alt="URL preview"
                    onError={() => setImgLoadError(true)}
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute top-2 right-2">
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md bg-black/60 text-white hover:bg-black transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message Display */}
      {error && (
        <div className="flex items-center gap-1.5 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Optional Helper Text */}
      {helpText && <p className="text-[11px] text-steel">{helpText}</p>}
    </div>
  );
}
