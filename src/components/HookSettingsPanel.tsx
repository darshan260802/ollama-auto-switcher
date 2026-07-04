import { useState } from "react";
import { Copy, Check, RefreshCw, Terminal } from "lucide-react";
import type { UserSettings } from "../hooks/useUserSettings";

interface HookSettingsPanelProps {
  userId: string;
  settings: UserSettings;
  loading: boolean;
  onToggleAutoSwitch: (enabled: boolean) => Promise<void>;
  onSetApiToken: (token: string | null) => Promise<void>;
}

function generateApiToken(userId: string): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const secret = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    ""
  );
  return `${userId}:${secret}`;
}

export function HookSettingsPanel({
  userId,
  settings,
  loading,
  onToggleAutoSwitch,
  onSetApiToken,
}: HookSettingsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleCopy = async () => {
    if (!settings.apiToken) return;
    try {
      await navigator.clipboard.writeText(settings.apiToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy token:", err);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const token = generateApiToken(userId);
      await onSetApiToken(token);
    } catch (err) {
      console.error("Failed to generate token:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleAutoSwitch(!settings.autoSwitchEnabled);
    } catch (err) {
      console.error("Failed to toggle auto-switch:", err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body p-5">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-primary" />
          <h3 className="card-title text-base">Claude Code Hook</h3>
        </div>

        <div className="space-y-4">
          {/* Auto-switch toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-sm">Auto-switch accounts</span>
              <span className="text-xs text-base-content/60">
                Switch to the lowest-usage account when usage is high.
              </span>
            </div>
            <button
              onClick={handleToggle}
              disabled={loading || isToggling}
              className={`btn btn-sm ${
                settings.autoSwitchEnabled ? "btn-primary" : "btn-outline"
              }`}
            >
              {isToggling ? (
                <span className="loading loading-spinner loading-xs" />
              ) : settings.autoSwitchEnabled ? (
                "Enabled"
              ) : (
                "Disabled"
              )}
            </button>
          </div>

          {/* Token display */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Hook API token</span>

            {settings.apiToken ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={settings.apiToken}
                  className="input input-sm input-bordered flex-1 font-mono text-xs"
                />
                <button
                  onClick={handleCopy}
                  className="btn btn-sm btn-outline"
                  title="Copy token"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn btn-sm btn-outline"
                  title="Regenerate token"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn btn-sm btn-primary w-full"
              >
                {isGenerating ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Generating...
                  </>
                ) : (
                  "Generate hook token"
                )}
              </button>
            )}

            <p className="text-xs text-base-content/50">
              Paste this token into your Claude Code hook environment variable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
