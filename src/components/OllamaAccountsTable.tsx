import { useState } from "react";
import { Plug, Pencil, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import type { OllamaAccount } from "../types/ollamaAccount";

interface OllamaAccountsTableProps {
  accounts: OllamaAccount[];
  onConnect: (account: OllamaAccount) => void;
  onEdit: (account: OllamaAccount) => void;
  onRefresh: (account: OllamaAccount) => void;
  onDelete: (account: OllamaAccount) => void;
}

export function OllamaAccountsTable({
  accounts,
  onConnect,
  onEdit,
  onRefresh,
  onDelete,
}: OllamaAccountsTableProps) {
  const [deletingAccount, setDeletingAccount] = useState<OllamaAccount | null>(null);

  const handleDeleteClick = (account: OllamaAccount) => {
    setDeletingAccount(account);
  };

  const handleConfirmDelete = () => {
    if (deletingAccount) {
      onDelete(deletingAccount);
      setDeletingAccount(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingAccount(null);
  };

  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra table-bordered w-full">
          <thead>
            <tr className="bg-base-200">
              <th>Email</th>
              <th className="text-center">Session Usage</th>
              <th className="text-center">Session Reset In</th>
              <th className="text-center">Weekly Usage</th>
              <th className="text-center">Weekly Reset In</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/50">
                  No accounts added yet. Click the button above to add your first Ollama account.
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id}>
                  <td className="font-medium">{account.email}</td>
                  <td className="text-center text-sm">
                    {account.sessionUsage !== undefined ? `${account.sessionUsage}/100` : "-"}
                  </td>
                  <td className="text-center text-sm">
                    {account.sessionResetIn || "-"}
                  </td>
                  <td className="text-center text-sm">
                    {account.weeklySessionUsage !== undefined ? `${account.weeklySessionUsage}/500` : "-"}
                  </td>
                  <td className="text-center text-sm">
                    {account.weeklySessionResetIn || "-"}
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onConnect(account)}
                        className="btn btn-ghost btn-xs gap-1"
                      >
                        <Plug className="w-3 h-3" />
                        Connect
                      </button>
                      <button
                        onClick={() => onEdit(account)}
                        className="btn btn-ghost btn-xs gap-1"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => onRefresh(account)}
                        className="btn btn-ghost btn-xs gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Refresh
                      </button>
                      <button
                        onClick={() => handleDeleteClick(account)}
                        className="btn btn-ghost btn-xs gap-1 text-error hover:bg-error/10"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingAccount && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleCancelDelete}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-sm card bg-base-100 shadow-xl mx-4 p-6">
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-error" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-base-content">
                Delete Account?
              </h3>

              {/* Message */}
              <p className="text-base-content/70 px-2">
                Are you sure you want to delete <strong className="text-base-content">"{deletingAccount.email}"</strong>?
              </p>
              <p className="text-sm text-base-content/50">
                This action cannot be undone.
              </p>

              {/* Actions */}
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={handleCancelDelete}
                  className="btn btn-ghost min-w-[100px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="btn btn-error min-w-[100px]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
