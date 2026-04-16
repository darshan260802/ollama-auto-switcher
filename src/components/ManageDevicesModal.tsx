import { useState } from "react";
import { X, Pencil, Trash2, AlertTriangle } from "lucide-react";
import type { Device } from "../types/device";

interface ManageDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  onEditDevice: (device: Device) => void;
  onDeleteDevice: (deviceId: string) => Promise<void>;
}

export function ManageDevicesModal({
  isOpen,
  onClose,
  devices,
  onEditDevice,
  onDeleteDevice,
}: ManageDevicesModalProps) {
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (device: Device) => {
    onEditDevice(device);
  };

  const handleDeleteClick = (device: Device) => {
    setDeletingDevice(device);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDevice) return;

    setIsDeleting(true);
    try {
      await onDeleteDevice(deletingDevice.id);
      setDeletingDevice(null);
    } catch (err) {
      console.error("Failed to delete device:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeletingDevice(null);
  };

  const handleClose = () => {
    if (!isDeleting) {
      setDeletingDevice(null);
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
      <div className="relative z-10 w-full max-w-lg card bg-base-100 shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-200">
          <h2 className="text-xl font-bold text-base-content">Manage Devices</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device List */}
        <div className="p-6">
          {devices.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <p>No devices added yet</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {devices.map((device) => (
                <li
                  key={device.id}
                  className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium truncate">
                      {device.nickname || device.name}
                    </span>
                    {device.nickname && (
                      <span className="text-xs text-base-content/60 truncate">
                        {device.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(device)}
                      disabled={isDeleting}
                      className="btn btn-ghost btn-sm btn-circle"
                      title="Edit device"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(device)}
                      disabled={isDeleting}
                      className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10"
                      title="Delete device"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deletingDevice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={!isDeleting ? handleCancelDelete : undefined}
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
                Delete Device?
              </h3>

              {/* Message */}
              <p className="text-base-content/70 px-2">
                Are you sure you want to delete <strong className="text-base-content">"{deletingDevice.nickname || deletingDevice.name}"</strong>?
              </p>
              <p className="text-sm text-base-content/50">
                This action cannot be undone.
              </p>

              {/* Actions */}
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="btn btn-ghost min-w-[100px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="btn btn-error min-w-[100px]"
                >
                  {isDeleting ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
