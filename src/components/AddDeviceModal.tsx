import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Device } from "../types/device";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceAdded: (device: Device) => void;
  onError: (error: string) => void;
}

export function AddDeviceModal({
  isOpen,
  onClose,
  onDeviceAdded,
  onError,
}: AddDeviceModalProps) {
  const [nickname, setNickname] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Parse Ollama URL to extract name and key
  const parseOllamaUrl = (
    url: string
  ): { name: string; key: string } | null => {
    try {
      const urlObj = new URL(url);
      const name = urlObj.searchParams.get("name");
      const key = urlObj.searchParams.get("key");
      if (!name || !key) return null;
      return { name, key };
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate URL
    if (!url.trim()) {
      setValidationError("Ollama URL is required");
      return;
    }

    const parsed = parseOllamaUrl(url);
    if (!parsed) {
      setValidationError(
        "Invalid URL format. Please use the Ollama connect URL format."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Create device object (will be passed to parent for Firestore operation)
      const newDevice = {
        name: parsed.name,
        key: parsed.key,
        nickname: nickname.trim() || undefined,
      };

      // Call parent's add device function
      const addedDevice = await onDeviceAdded(newDevice as Device);

      // Reset form
      setNickname("");
      setUrl("");
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to add device");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNickname("");
      setUrl("");
      setValidationError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg p-8 card bg-base-100 shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-base-content">Add New Device</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nickname Input */}
          <div className="form-control">
            <label className="label" htmlFor="nickname">
              <span className="label-text">Device Nickname</span>
              <span className="label-text-alt">Optional</span>
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., My Gaming PC"
              className="input input-bordered w-full"
              disabled={isLoading}
            />
            <label className="label">
              <span className="label-text-alt">
                Defaults to device name if not specified
              </span>
            </label>
          </div>

          {/* URL Input */}
          <div className="form-control">
            <label className="label" htmlFor="url">
              <span className="label-text">Ollama Device Signin URL</span>
              <span className="label-text-alt text-error">Required</span>
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ollama.com/connect?name=...&key=..."
              className="input input-bordered w-full"
              disabled={isLoading}
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="alert alert-error">
              <span>{validationError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Adding...
                </>
              ) : (
                "Add Device"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
