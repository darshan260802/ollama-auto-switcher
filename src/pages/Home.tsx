import { useState, useRef } from "react";
import { Plus, ChevronDown, Check, Settings, AlertTriangle } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { AddDeviceModal } from "../components/AddDeviceModal";
import { ManageDevicesModal } from "../components/ManageDevicesModal";
import { OllamaAccountsTable } from "../components/OllamaAccountsTable";
import { AddOllamaAccountModal } from "../components/AddOllamaAccountModal";
import { useAuth } from "../context/AuthContext";
import { useDevices } from "../hooks/useDevices";
import { useOllamaAccounts } from "../hooks/useOllamaAccounts";
import { API_BASE_URL } from "../config/api";
import type { Device } from "../types/device";
import type { OllamaAccount } from "../types/ollamaAccount";

export function Home() {
  const { user } = useAuth();
  const { devices, loading, addDevice, deleteDevice, updateDevice } = useDevices(user?.uid);
  const { accounts, loading: accountsLoading, addAccount, updateAccount, deleteAccount, refreshAccountUsage, connectAccount, disconnectAccount } = useOllamaAccounts(user?.uid);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isOllamaAccountModalOpen, setIsOllamaAccountModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editingOllamaAccount, setEditingOllamaAccount] = useState<OllamaAccount | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [ollamaAccountModalMode, setOllamaAccountModalMode] = useState<"add" | "edit">("add");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [connectionErrorModal, setConnectionErrorModal] = useState<{ isOpen: boolean; message: string } | null>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  // Format device option for dropdown display
  const formatDeviceOption = (device: Device): string => {
    if (device.nickname) {
      return `${device.name} (${device.nickname})`;
    }
    return device.name;
  };

  // Handle device selection - close dropdown by blurring the button
  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    // Close dropdown by blurring the trigger button
    dropdownButtonRef.current?.blur();
  };

  // Handle adding a new device
  const handleDeviceSubmit = async (deviceData: { name: string; key: string; nickname?: string }) => {
    if (modalMode === "edit" && editingDevice) {
      // Update existing device
      try {
        await updateDevice(editingDevice.id, { nickname: deviceData.nickname });
        setToast({ message: "Device updated successfully!", type: "success" });
        setTimeout(() => setToast(null), 3000);
        setEditingDevice(null);
        setModalMode("add");
      } catch (err) {
        throw err;
      }
    } else {
      // Add new device
      try {
        const newDevice = await addDevice(deviceData);
        setSelectedDevice(newDevice);
        setToast({ message: "Device added successfully!", type: "success" });
        setTimeout(() => setToast(null), 3000);
        return newDevice;
      } catch (err) {
        throw err;
      }
    }
  };

  // Handle error from modal
  const handleError = (error: string) => {
    setToast({ message: error, type: "error" });
    setTimeout(() => setToast(null), 5000);
  };

  // Open manage devices modal
  const handleManageDevices = () => {
    setIsManageModalOpen(true);
  };

  // Handle edit device from manage modal
  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setModalMode("edit");
    setIsManageModalOpen(false);
    setIsModalOpen(true);
  };

  // Handle delete device from manage modal
  const handleDeleteDevice = async (deviceId: string) => {
    try {
      await deleteDevice(deviceId);
      setToast({ message: "Device deleted successfully!", type: "success" });
      setTimeout(() => setToast(null), 3000);
      // Clear selection if the deleted device was selected
      if (selectedDevice?.id === deviceId) {
        setSelectedDevice(null);
      }
    } catch (err) {
      setToast({ message: "Failed to delete device", type: "error" });
      setTimeout(() => setToast(null), 5000);
      throw err;
    }
  };

  // Handle modal close - reset edit state
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
    setModalMode("add");
  };

  // Ollama Account handlers
  const handleAddOllamaAccount = () => {
    setOllamaAccountModalMode("add");
    setEditingOllamaAccount(null);
    setIsOllamaAccountModalOpen(true);
  };

  const handleEditOllamaAccount = (account: OllamaAccount) => {
    setOllamaAccountModalMode("edit");
    setEditingOllamaAccount(account);
    setIsOllamaAccountModalOpen(true);
  };

  const handleDeleteOllamaAccount = async (account: OllamaAccount) => {
    try {
      await deleteAccount(account.id);
      setToast({ message: "Account deleted successfully!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ message: "Failed to delete account", type: "error" });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleConnectAccount = async (account: OllamaAccount) => {
    if (!selectedDevice) {
      setToast({ message: "Please select a device first", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      // Check if another account is already connected
      const connectedAccount = accounts.find((acc) => acc.connected && acc.id !== account.id);

      // If another account is connected, disconnect it first via API
      if (connectedAccount) {
        const disconnectResponse = await fetch(`${API_BASE_URL}/ollama/disconnect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth: connectedAccount.authToken,
            enc_key: selectedDevice.key,
          }),
        });

        if (!disconnectResponse.ok) {
          throw new Error("Failed to disconnect current account");
        }

        // Update Firestore to disconnect the old account
        await disconnectAccount(connectedAccount.id);
      }

      // Call connect API
      const response = await fetch(`${API_BASE_URL}/ollama/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth: account.authToken,
          name: selectedDevice.name,
          enc_key: selectedDevice.key,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.connect) {
        const serverMessage = data.msg || "";
        throw new Error(serverMessage || "Connection failed");
      }

      // Update Firestore to mark account as connected
      await connectAccount(account.id);

      setToast({ message: "Account connected successfully!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Connection failed:", error);
      const errorMsg = error instanceof Error ? error.message : "";
      const staticMsg = 'Try running "ollama signout" in the selected machine terminal and try again.';
      setConnectionErrorModal({
        isOpen: true,
        message: errorMsg ? `${errorMsg}\n\n${staticMsg}` : staticMsg,
      });
    }
  };

  const handleDisconnectAccount = async (account: OllamaAccount) => {
    if (!selectedDevice) return;

    try {
      // Call disconnect API
      const response = await fetch(`${API_BASE_URL}/ollama/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth: account.authToken,
          enc_key: selectedDevice.key,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      // Update Firestore
      await disconnectAccount(account.id);

      setToast({ message: "Account disconnected successfully!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Disconnect failed:", error);
      setToast({ message: "Failed to disconnect account", type: "error" });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleRefreshAccount = async (account: OllamaAccount) => {
    try {
      await refreshAccountUsage(account.id, account.authToken);
    } catch (error) {
      console.error("Failed to refresh account:", error);
      setToast({ message: "Failed to refresh usage data", type: "error" });
      setTimeout(() => setToast(null), 5000);
      throw error;
    }
  };

  const handleOllamaAccountSubmit = async (accountData: { email: string; authToken: string }) => {
    if (ollamaAccountModalMode === "edit" && editingOllamaAccount) {
      // Update existing account
      try {
        await updateAccount(editingOllamaAccount.id, {
          email: accountData.email,
          ...(accountData.authToken ? { authToken: accountData.authToken } : {}),
        });
        setToast({ message: "Account updated successfully!", type: "success" });
        setTimeout(() => setToast(null), 3000);
        setEditingOllamaAccount(null);
        setOllamaAccountModalMode("add");
      } catch (err) {
        throw err;
      }
    } else {
      // Add new account
      try {
        await addAccount(accountData);
        setToast({ message: "Account added successfully!", type: "success" });
        setTimeout(() => setToast(null), 3000);
      } catch (err) {
        throw err;
      }
    }
  };

  const handleOllamaAccountModalClose = () => {
    setIsOllamaAccountModalOpen(false);
    setEditingOllamaAccount(null);
    setOllamaAccountModalMode("add");
  };

  return (
    <div className="flex flex-1 flex-col bg-base-100">
      <Navbar />

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-top toast-end z-50`}>
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
            <Check className="w-5 h-5" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col p-6 gap-6">
        {/* Device Selector Section */}
        <div className="flex items-center gap-4">
          {/* Device Dropdown */}
          <div className="dropdown dropdown-end flex-1">
            <button
              ref={dropdownButtonRef}
              tabIndex={0}
              className="btn btn-outline w-full justify-between"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : selectedDevice ? (
                <span className="truncate">{formatDeviceOption(selectedDevice)}</span>
              ) : devices.length > 0 ? (
                <span className="text-base-content/50">Select a device</span>
              ) : (
                <span className="text-base-content/50">No devices</span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full min-w-[200px] max-h-60 overflow-y-auto z-10"
            >
              {devices.length === 0 ? (
                <li className="disabled">
                  <span className="text-base-content/50">No devices added yet</span>
                </li>
              ) : (
                devices.map((device) => (
                  <li key={device.id}>
                    <button
                      onClick={() => handleDeviceSelect(device)}
                      className={selectedDevice?.id === device.id ? "active" : ""}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{device.name}</span>
                        {device.nickname && (
                          <span className="text-xs text-base-content/60">{device.nickname}</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Add Device Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Device
          </button>

          {/* Manage Devices Button */}
          <button
            onClick={handleManageDevices}
            className="btn btn-outline btn-sm gap-2"
            disabled={devices.length === 0}
          >
            <Settings className="w-4 h-4" />
            Manage Devices
          </button>
        </div>

        {/* Divider */}
        {selectedDevice && <div className="divider"></div>}

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {selectedDevice ? (
            <>
              {/* Ollama Accounts Section */}
              <div className="space-y-4">
                {/* Header with Add Button */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-base-content">Ollama Accounts</h2>
                  <button
                    onClick={handleAddOllamaAccount}
                    className="btn btn-outline btn-sm gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Ollama Account
                  </button>
                </div>

                {accountsLoading ? (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-md" />
                  </div>
                ) : (
                  <OllamaAccountsTable
                    accounts={accounts}
                    selectedDevice={selectedDevice}
                    connectedAccountId={accounts.find((acc) => acc.connected)?.id || null}
                    onConnect={handleConnectAccount}
                    onDisconnect={handleDisconnectAccount}
                    onEdit={handleEditOllamaAccount}
                    onRefresh={handleRefreshAccount}
                    onDelete={handleDeleteOllamaAccount}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-2">Hello World</h1>
                <p className="text-base-content/70">Select a device to get started</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Device Modal */}
      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleDeviceSubmit}
        onError={handleError}
        mode={modalMode}
        device={editingDevice || undefined}
      />

      {/* Manage Devices Modal */}
      <ManageDevicesModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        devices={devices}
        onEditDevice={handleEditDevice}
        onDeleteDevice={handleDeleteDevice}
      />

      {/* Add/Edit Ollama Account Modal */}
      <AddOllamaAccountModal
        isOpen={isOllamaAccountModalOpen}
        onClose={handleOllamaAccountModalClose}
        onSubmit={handleOllamaAccountSubmit}
        onError={handleError}
        mode={ollamaAccountModalMode}
        account={editingOllamaAccount || undefined}
      />

      {/* Connection Error Modal */}
      {connectionErrorModal?.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setConnectionErrorModal(null)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md card bg-base-100 shadow-xl mx-4 p-6">
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-error" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-base-content">
                Connection Failed
              </h3>

              {/* Message */}
              <div className="text-base-content/70 px-2 whitespace-pre-line">
                {connectionErrorModal.message}
              </div>

              {/* Actions */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setConnectionErrorModal(null)}
                  className="btn btn-primary min-w-[100px]"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
