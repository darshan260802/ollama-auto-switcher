import { useState, useEffect, type FormEvent } from "react";
import { X, Info } from "lucide-react";
import type { OllamaAccount } from "../types/ollamaAccount";

interface AddOllamaAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountData: { email: string; authToken: string }) => Promise<void>;
  onError: (error: string) => void;
  mode?: "add" | "edit";
  account?: OllamaAccount;
}

export function AddOllamaAccountModal({
  isOpen,
  onClose,
  onSubmit,
  onError,
  mode = "add",
  account,
}: AddOllamaAccountModalProps) {
  const [email, setEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isEditMode = mode === "edit";

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isEditMode && account) {
      setEmail(account.email);
      setAuthToken("");
    } else {
      setEmail("");
      setAuthToken("");
    }
    setValidationError(null);
  }, [isEditMode, account, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!email.trim()) {
      setValidationError("Email is required");
      return;
    }

    if (!authToken.trim() && !isEditMode) {
      setValidationError("Auth token is required");
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        email: email.trim(),
        authToken: authToken.trim(),
      });

      // Reset form and close
      setEmail("");
      setAuthToken("");
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : `Failed to ${isEditMode ? "update" : "add"} account`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail("");
      setAuthToken("");
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
            {isEditMode ? "Edit Ollama Account" : "Add New Ollama Account"}
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

        {/* Hint */}
        {!isEditMode && (
          <div className="alert alert-info mb-6">
            <Info className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm">
              <p>
                <strong>To get auth token:</strong> Open ollama.com in incognito mode, signin
                with this email, then in devtools from Application tab in Cookies, copy value of
                "__Secure-session" cookie and paste it here.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Input */}
          <div className="form-control">
            <label className="label" htmlFor="email">
              <span className="label-text">Email</span>
              <span className="label-text-alt text-error">Required</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="input input-bordered w-full"
              disabled={isLoading}
            />
          </div>

          {/* Auth Token Input */}
          <div className="form-control">
            <label className="label" htmlFor="authToken">
              <span className="label-text">Auth Token</span>
              <span className="label-text-alt text-error">
                {isEditMode ? "Leave blank to keep current" : "Required"}
              </span>
            </label>
            <input
              id="authToken"
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder={isEditMode ? "Enter new token to update" : "Paste __Secure-session cookie value"}
              className="input input-bordered w-full font-mono text-sm"
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
                  {isEditMode ? "Saving..." : "Adding..."}
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Add Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
