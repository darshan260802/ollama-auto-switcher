import { useState, useEffect, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Device } from "../types/device";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deviceData: { name: string; key: string; nickname?: string }) => Promise<Device | undefined>;
  onError: (error: string) => void;
  mode?: "add" | "edit";
  device?: Device;
}

export function AddDeviceModal({
  isOpen,
  onClose,
  onSubmit,
  onError,
  mode = "add",
  device,
}: AddDeviceModalProps) {
  const [nickname, setNickname] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isEditMode = mode === "edit";

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isEditMode && device) {
      setNickname(device.nickname || "");
      // Reconstruct URL from device data for display (disabled)
      const reconstructedUrl = `https://ollama.com/connect?name=${encodeURIComponent(device.name)}&key=${encodeURIComponent(device.key)}`;
      setUrl(reconstructedUrl);
    } else {
      setNickname("");
      setUrl("");
    }
    setValidationError(null);
  }, [isEditMode, device, isOpen]);

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

    let deviceData: { name: string; key: string; nickname?: string };

    if (isEditMode && device) {
      // In edit mode, use existing device data
      deviceData = {
        name: device.name,
        key: device.key,
        nickname: nickname.trim() || undefined,
      };
    } else {
      // In add mode, validate and parse URL
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

      deviceData = {
        name: parsed.name,
        key: parsed.key,
        nickname: nickname.trim() || undefined,
      };
    }

    setIsLoading(true);

    try {
      // Call parent's submit function
      await onSubmit(deviceData);

      // Reset form and close
      setNickname("");
      setUrl("");
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : `Failed to ${isEditMode ? "update" : "add"} device`);
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
          <h2 className="text-xl font-bold text-base-content">
            {isEditMode ? "Edit Device" : "Add New Device"}
          </h2>
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
              <span className="label-text-alt text-error">
                {isEditMode ? "Cannot be changed" : "Required"}
              </span>
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ollama.com/connect?name=...&key=..."
              className="input input-bordered w-full"
              disabled={isLoading || isEditMode}
              readOnly={isEditMode}
            />
            {isEditMode && (
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  Device URL cannot be modified after creation
                </span>
              </label>
            )}
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
                  {isEditMode ? "Saving..." : "Adding..."}
                </>
              ) : isEditMode ? (
                "Save Changes"
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
