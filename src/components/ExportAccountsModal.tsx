import { useState } from "react";
import { X, Download, CheckSquare, Square } from "lucide-react";
import type { OllamaAccount } from "../types/ollamaAccount";

interface ExportAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: OllamaAccount[];
}

export function ExportAccountsModal({
  isOpen,
  onClose,
  accounts,
}: ExportAccountsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Select all by default when modal opens
  if (isOpen && selectedIds.size === 0 && accounts.length > 0) {
    // Select all by default
    setSelectedIds(new Set(accounts.map((a) => a.id)));
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === accounts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(accounts.map((a) => a.id)));
    }
  };

  const handleExport = () => {
    const selectedAccounts = accounts
      .filter((a) => selectedIds.has(a.id))
      .map((a) => ({
        email: a.email,
        authToken: a.authToken,
      }));

    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts: selectedAccounts,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ollama-accounts-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onClose();
    setSelectedIds(new Set());
  };

  const handleClose = () => {
    onClose();
    setSelectedIds(new Set());
  };

  const allSelected = accounts.length > 0 && selectedIds.size === accounts.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < accounts.length;
  const hasSelection = selectedIds.size > 0;

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
      <div className="relative z-10 w-full max-w-lg p-6 card bg-base-100 shadow-xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-base-content">Export Accounts</h2>
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-base-content/70 mb-4">
          Select the accounts you want to export. The exported file can be imported on another device.
        </p>

        {/* Select All */}
        <div
          className="flex items-center gap-3 p-3 border-b border-base-300 cursor-pointer hover:bg-base-200/50 rounded-t-lg"
          onClick={toggleSelectAll}
        >
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle"
            onClick={(e) => {
              e.stopPropagation();
              toggleSelectAll();
            }}
          >
            {allSelected ? (
              <CheckSquare className="w-5 h-5 text-primary" />
            ) : someSelected ? (
              <div className="relative w-5 h-5">
                <Square className="w-5 h-5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-primary rounded-sm" />
                </div>
              </div>
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
          <span className="font-medium">Select All</span>
          <span className="text-sm text-base-content/50 ml-auto">
            {selectedIds.size} of {accounts.length} selected
          </span>
        </div>

        {/* Accounts List */}
        <div className="flex-1 overflow-y-auto border-b border-base-300 max-h-[300px]">
          {accounts.length === 0 ? (
            <div className="p-8 text-center text-base-content/50">
              No accounts to export
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-base-200/50"
                  onClick={() => toggleSelection(account.id)}
                >
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(account.id);
                    }}
                  >
                    {selectedIds.has(account.id) ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{account.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!hasSelection}
            className="btn btn-primary gap-2"
          >
            <Download className="w-4 h-4" />
            Export {hasSelection ? `(${selectedIds.size})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
